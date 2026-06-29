import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
var hooks = require('../../src/store/hooks');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var BASE_URL = apiModule.BASE_URL;
var getToken = hooks.getToken;
var useAuth = hooks.useAuth;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

function fmt(d) {
  return new Date(d).toLocaleDateString('fr-SN', { day:'numeric', month:'long', year:'numeric' });
}
function fmtPrice(p) {
  return new Intl.NumberFormat('fr-SN').format(p);
}

export default function ContractDetail() {
  var params = useLocalSearchParams();
  var auth = useAuth();
  var user = auth.user;
  var contractS = useState(null); var contract = contractS[0]; var setContract = contractS[1];
  var loadingS = useState(true); var loading = loadingS[0]; var setLoading = loadingS[1];
  var signingS = useState(false); var signing = signingS[0]; var setSigning = signingS[1];
  var rejectingS = useState(false); var rejecting = rejectingS[0]; var setRejecting = rejectingS[1];
  var signModalS = useState(false); var signModal = signModalS[0]; var setSignModal = signModalS[1];
  var rejectModalS = useState(false); var rejectModal = rejectModalS[0]; var setRejectModal = rejectModalS[1];
  var acceptedS = useState(false); var accepted = acceptedS[0]; var setAccepted = acceptedS[1];
  var hasReviewS = useState(false); var hasReview = hasReviewS[0]; var setHasReview = hasReviewS[1];

  useEffect(function() {
    var token = getToken();
    api.get('/contracts/'+params.id, token).then(function(data) {
      setContract(data);
      setLoading(false);
      // Vérifier si review existe
      api.get('/reviews/contract/'+params.id, token).then(function(r) {
        if (r && r.id) setHasReview(true);
      }).catch(function(){});
    }).catch(function(err) {
      console.log('Error:', JSON.stringify(err));
      setLoading(false);
    });
  }, [params.id]);

  function doSign() {
    var token = getToken();
    setSigning(true);
    setSignModal(false);
    fetch(BASE_URL+'/contracts/'+params.id+'/sign', {
      method: 'PATCH',
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+token, 'ngrok-skip-browser-warning':'true' },
      body: JSON.stringify({}),
    }).then(function(r){ return r.json(); }).then(function(data) {
      setSigning(false);
      if (data.status === 'SIGNED') {
        setContract(data);
        Toast.show({ type:'success', text1:'✅ Contrat signé !', text2:'Vous pouvez maintenant payer la caution', visibilityTime:3000 });
      } else {
        Toast.show({ type:'error', text1:'Erreur', text2:data.message||'Impossible de signer', visibilityTime:3000 });
      }
    }).catch(function(err) {
      setSigning(false);
      Toast.show({ type:'error', text1:'Erreur réseau', visibilityTime:2000 });
    });
  }

  function doReject() {
    var token = getToken();
    setRejecting(true);
    setRejectModal(false);
    fetch(BASE_URL+'/contracts/'+params.id+'/reject', {
      method: 'PATCH',
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+token, 'ngrok-skip-browser-warning':'true' },
      body: JSON.stringify({}),
    }).then(function(r){ return r.json(); }).then(function(data) {
      setRejecting(false);
      setContract(data);
      Toast.show({ type:'info', text1:'Contrat refusé', visibilityTime:2000 });
    }).catch(function() {
      setRejecting(false);
      Toast.show({ type:'error', text1:'Erreur', visibilityTime:2000 });
    });
  }

  function handlePay() {
    if (!contract) return;
    var amount = contract.listing ? (contract.listing.deposit || contract.listing.price) : 0;
    router.push('/payment?amount='+amount+'&description=Caution - '+contract.listing.title);
  }

  function handleReview() {
    var ownerName = contract.owner ? contract.owner.firstName+' '+contract.owner.lastName : '';
    var listingTitle = contract.listing ? contract.listing.title : '';
    router.push('/reviews/'+params.id+'?ownerName='+encodeURIComponent(ownerName)+'&listingTitle='+encodeURIComponent(listingTitle));
  }

  function handleDownload() {
    var token = getToken();
    var url = BASE_URL+'/contracts/'+params.id+'/pdf';
    fetch(url, {
      method: 'GET',
      headers: { 'Authorization':'Bearer '+token, 'ngrok-skip-browser-warning':'true' },
    }).then(function(r) {
      if (r.ok) {
        if (typeof window !== 'undefined') {
          return r.blob().then(function(blob) {
            var blobUrl = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'contrat-deukway.pdf';
            a.click();
            window.URL.revokeObjectURL(blobUrl);
          });
        } else {
          Linking.openURL(url);
        }
      } else {
        Toast.show({ type:'error', text1:'Erreur téléchargement', visibilityTime:2000 });
      }
    }).catch(function() {
      Toast.show({ type:'error', text1:'Erreur réseau', visibilityTime:2000 });
    });
  }

  if (loading) return (
    <View style={{flex:1,backgroundColor:'#F5F5F0',alignItems:'center',justifyContent:'center'}}>
      <Text style={{color:C.muted}}>Chargement...</Text>
    </View>
  );

  if (!contract) return (
    <View style={{flex:1,backgroundColor:'#F5F5F0',alignItems:'center',justifyContent:'center'}}>
      <Text style={{color:C.muted}}>Contrat introuvable</Text>
      <TouchableOpacity onPress={function(){router.back();}} style={{marginTop:S.md}}>
        <Text style={{color:C.primary}}>Retour</Text>
      </TouchableOpacity>
    </View>
  );

  var isTenant = user && user.role === 'TENANT';
  var isPending = contract.status === 'PENDING';
  var isSigned = contract.status === 'SIGNED';
  var isRejected = contract.status === 'REJECTED';

  return (
    <View style={{flex:1,backgroundColor:'#F5F5F0'}}>
      <LinearGradient colors={['#0A1F15','#1B4F3A','#2D7A5F']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}} style={{width:36,height:36,borderRadius:18,backgroundColor:'rgba(255,255,255,0.15)',alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={{fontSize:18,fontWeight:'900',color:'#fff',flex:1}}>Contrat de location</Text>
            <View style={{paddingHorizontal:10,paddingVertical:4,borderRadius:R.full,backgroundColor:isSigned?'#059669':isRejected?'#DC2626':'#F59E0B'}}>
              <Text style={{fontSize:10,fontWeight:'800',color:'#fff'}}>{isSigned?'SIGNÉ':isRejected?'REFUSÉ':'EN ATTENTE'}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg}}>

        {/* Lettre officielle */}
        <View style={{backgroundColor:'#fff',borderRadius:4,elevation:8,marginBottom:S.lg,overflow:'hidden'}}>
          <View style={{backgroundColor:'#1B4F3A',padding:S.xl}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
              <View>
                <Text style={{fontSize:22,fontWeight:'900',color:'#fff',letterSpacing:2}}>DEUKWAY</Text>
                <Text style={{fontSize:F.xs,color:'rgba(255,255,255,0.7)',marginTop:2,letterSpacing:1}}>PLATEFORME IMMOBILIÈRE</Text>
              </View>
              <View style={{alignItems:'flex-end'}}>
                <View style={{backgroundColor:isSigned?'#059669':isRejected?'#DC2626':'#F59E0B',paddingHorizontal:12,paddingVertical:5,borderRadius:4}}>
                  <Text style={{fontSize:10,fontWeight:'900',color:'#fff',letterSpacing:1}}>{isSigned?'SIGNÉ':isRejected?'REFUSÉ':'EN ATTENTE'}</Text>
                </View>
                <Text style={{fontSize:F.xs,color:'rgba(255,255,255,0.6)',marginTop:6}}>N° {params.id?params.id.slice(0,8).toUpperCase():'—'}</Text>
              </View>
            </View>
          </View>

          <View style={{height:4,backgroundColor:'#D4821A'}} />

          <View style={{padding:S.xl}}>
            <View style={{alignItems:'center',marginBottom:S.xl}}>
              <Text style={{fontSize:15,fontWeight:'900',color:'#1B4F3A',letterSpacing:2,textTransform:'uppercase'}}>Contrat de Location</Text>
              <View style={{width:60,height:2,backgroundColor:'#D4821A',marginTop:8}} />
              <Text style={{fontSize:F.xs,color:C.muted,marginTop:8}}>Dakar, le {fmt(contract.createdAt)}</Text>
            </View>

            <Text style={{fontSize:F.sm,fontWeight:'800',color:'#333',marginBottom:S.md,textTransform:'uppercase',letterSpacing:0.5}}>Entre les soussignés :</Text>

            <View style={{borderLeftWidth:3,borderLeftColor:'#1B4F3A',paddingLeft:S.md,marginBottom:S.lg}}>
              <Text style={{fontSize:F.xs,fontWeight:'900',color:'#1B4F3A',letterSpacing:1,marginBottom:6}}>LE BAILLEUR</Text>
              <Text style={{fontSize:F.base,fontWeight:'800',color:'#111'}}>{contract.owner?contract.owner.firstName+' '+contract.owner.lastName:'—'}</Text>
              <Text style={{fontSize:F.sm,color:C.muted,marginTop:2}}>Tél : {contract.owner?contract.owner.phone:'—'}</Text>
              <Text style={{fontSize:F.sm,color:C.muted}}>Qualité : Propriétaire bailleur</Text>
            </View>

            <View style={{borderLeftWidth:3,borderLeftColor:'#D4821A',paddingLeft:S.md,marginBottom:S.xl}}>
              <Text style={{fontSize:F.xs,fontWeight:'900',color:'#D4821A',letterSpacing:1,marginBottom:6}}>LE LOCATAIRE</Text>
              <Text style={{fontSize:F.base,fontWeight:'800',color:'#111'}}>{contract.tenant?contract.tenant.firstName+' '+contract.tenant.lastName:'—'}</Text>
              <Text style={{fontSize:F.sm,color:C.muted,marginTop:2}}>Tél : {contract.tenant?contract.tenant.phone:'—'}</Text>
              <Text style={{fontSize:F.sm,color:C.muted}}>Qualité : Preneur à bail</Text>
            </View>

            <View style={{height:0.5,backgroundColor:'#E0E0E0',marginBottom:S.xl}} />
            <Text style={{fontSize:F.sm,color:'#444',lineHeight:22,marginBottom:S.xl,fontStyle:'italic'}}>Il a été convenu et arrêté ce qui suit :</Text>

            <View style={{marginBottom:S.lg}}>
              <Text style={{fontSize:F.sm,fontWeight:'900',color:'#1B4F3A',marginBottom:S.sm}}>Art. 1 — OBJET DU CONTRAT</Text>
              <View style={{backgroundColor:'#F8FFF8',borderRadius:8,padding:S.md,borderWidth:0.5,borderColor:'#D1FAE5'}}>
                <Text style={{fontSize:F.sm,color:'#555'}}>• Désignation : {contract.listing?contract.listing.title:'—'}</Text>
                <Text style={{fontSize:F.sm,color:'#555',marginTop:4}}>• Type : {contract.listing?contract.listing.type:'—'}</Text>
                <Text style={{fontSize:F.sm,color:'#555',marginTop:4}}>• Adresse : {contract.listing?contract.listing.neighborhood+', '+contract.listing.city:'—'}</Text>
                {contract.listing&&contract.listing.surface&&<Text style={{fontSize:F.sm,color:'#555',marginTop:4}}>• Surface : {contract.listing.surface} m²</Text>}
              </View>
            </View>

            <View style={{marginBottom:S.lg}}>
              <Text style={{fontSize:F.sm,fontWeight:'900',color:'#1B4F3A',marginBottom:S.sm}}>Art. 2 — DURÉE</Text>
              <Text style={{fontSize:F.sm,color:'#555',lineHeight:20}}>Le présent contrat est conclu pour une durée d'un (1) an à compter de la date de signature, renouvelable par tacite reconduction sauf préavis d'un mois.</Text>
            </View>

            <View style={{marginBottom:S.lg}}>
              <Text style={{fontSize:F.sm,fontWeight:'900',color:'#1B4F3A',marginBottom:S.sm}}>Art. 3 — LOYER ET CAUTION</Text>
              <View style={{backgroundColor:'#FFFBF0',borderRadius:8,padding:S.md,borderWidth:0.5,borderColor:'#FDE68A'}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:6,borderBottomWidth:0.5,borderBottomColor:'#FDE68A'}}>
                  <Text style={{fontSize:F.sm,color:'#555'}}>Loyer mensuel</Text>
                  <Text style={{fontSize:F.sm,fontWeight:'900',color:'#1B4F3A'}}>{contract.listing?fmtPrice(contract.listing.price)+' FCFA':'—'}</Text>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:6,borderBottomWidth:0.5,borderBottomColor:'#FDE68A'}}>
                  <Text style={{fontSize:F.sm,color:'#555'}}>Caution</Text>
                  <Text style={{fontSize:F.sm,fontWeight:'900',color:'#1B4F3A'}}>{contract.listing&&contract.listing.deposit?fmtPrice(contract.listing.deposit)+' FCFA':'1 mois de loyer'}</Text>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:6}}>
                  <Text style={{fontSize:F.sm,color:'#555'}}>Échéance</Text>
                  <Text style={{fontSize:F.sm,fontWeight:'700',color:'#555'}}>Le 1er de chaque mois</Text>
                </View>
              </View>
            </View>

            {[
              {num:'4',title:'OBLIGATIONS DU LOCATAIRE',text:"Le locataire s'engage à payer le loyer aux échéances convenues, entretenir le logement en bon état, ne pas sous-louer sans accord écrit du bailleur, respecter le voisinage."},
              {num:'5',title:'OBLIGATIONS DU BAILLEUR',text:"Le bailleur s'engage à délivrer le logement en bon état, assurer la jouissance paisible, effectuer les réparations nécessaires ne relevant pas de l'entretien courant."},
              {num:'6',title:'RÉSILIATION',text:"Le contrat peut être résilié par l'une ou l'autre des parties avec un préavis écrit d'un (1) mois. En cas de non-paiement, le bailleur peut procéder à la résiliation après mise en demeure."},
            ].map(function(art) {
              return (
                <View key={art.num} style={{marginBottom:S.lg}}>
                  <Text style={{fontSize:F.sm,fontWeight:'900',color:'#1B4F3A',marginBottom:S.sm}}>Art. {art.num} — {art.title}</Text>
                  <Text style={{fontSize:F.sm,color:'#555',lineHeight:20}}>{art.text}</Text>
                </View>
              );
            })}

            <View style={{height:0.5,backgroundColor:'#E0E0E0',marginVertical:S.xl}} />
            <Text style={{fontSize:F.sm,fontWeight:'900',color:'#333',textAlign:'center',marginBottom:S.xl,textTransform:'uppercase',letterSpacing:1}}>Signatures des parties</Text>

            <View style={{flexDirection:'row',gap:S.lg}}>
              <View style={{flex:1,alignItems:'center'}}>
                <Text style={{fontSize:F.xs,color:C.muted,marginBottom:S.sm,textAlign:'center'}}>Le Bailleur</Text>
                <View style={{width:'100%',height:80,borderRadius:8,borderWidth:1.5,borderStyle:'dashed',borderColor:'#1B4F3A',backgroundColor:'#F0FDF4',alignItems:'center',justifyContent:'center'}}>
                  <Ionicons name="checkmark-circle" size={24} color="#059669" />
                  <Text style={{fontSize:F.xs,fontWeight:'800',color:'#059669',marginTop:4}}>Signé</Text>
                </View>
                <Text style={{fontSize:F.xs,fontWeight:'800',color:'#333',marginTop:S.sm,textAlign:'center'}}>{contract.owner?contract.owner.firstName+' '+contract.owner.lastName:''}</Text>
                <Text style={{fontSize:10,color:C.muted}}>Le {fmt(contract.createdAt)}</Text>
              </View>
              <View style={{flex:1,alignItems:'center'}}>
                <Text style={{fontSize:F.xs,color:C.muted,marginBottom:S.sm,textAlign:'center'}}>Le Locataire</Text>
                <View style={{width:'100%',height:80,borderRadius:8,borderWidth:1.5,borderStyle:'dashed',borderColor:isSigned?'#1B4F3A':isRejected?'#DC2626':'#F59E0B',backgroundColor:isSigned?'#F0FDF4':isRejected?'#FEE2E2':'#FFFBF0',alignItems:'center',justifyContent:'center'}}>
                  <Ionicons name={isSigned?'checkmark-circle':isRejected?'close-circle':'time-outline'} size={24} color={isSigned?'#059669':isRejected?'#DC2626':'#F59E0B'} />
                  <Text style={{fontSize:F.xs,fontWeight:'800',color:isSigned?'#059669':isRejected?'#DC2626':'#F59E0B',marginTop:4}}>{isSigned?'Signé':isRejected?'Refusé':'En attente'}</Text>
                </View>
                <Text style={{fontSize:F.xs,fontWeight:'800',color:'#333',marginTop:S.sm,textAlign:'center'}}>{contract.tenant?contract.tenant.firstName+' '+contract.tenant.lastName:''}</Text>
                {isSigned&&contract.signedAt&&<Text style={{fontSize:10,color:C.muted}}>Le {fmt(contract.signedAt)}</Text>}
              </View>
            </View>

            <View style={{marginTop:S.xl,paddingTop:S.md,borderTopWidth:0.5,borderTopColor:'#E0E0E0',alignItems:'center'}}>
              <Text style={{fontSize:10,color:C.muted,textAlign:'center'}}>Document généré par Deukway • Plateforme immobilière au Sénégal</Text>
              <Text style={{fontSize:10,color:C.muted,marginTop:2}}>Réf : {params.id?params.id.slice(0,8).toUpperCase():'—'}</Text>
            </View>
          </View>
        </View>

        {/* Télécharger */}
        <TouchableOpacity onPress={handleDownload} style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:S.md,backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.md,borderWidth:1.5,borderColor:'#1B4F3A',elevation:2}}>
          <Ionicons name="download-outline" size={20} color="#1B4F3A" />
          <Text style={{fontSize:F.base,fontWeight:'700',color:'#1B4F3A'}}>Télécharger le contrat (PDF)</Text>
        </TouchableOpacity>

        {/* Actions locataire PENDING */}
        {isTenant && isPending && (
          <View style={{gap:S.sm,marginBottom:S.lg}}>
            <TouchableOpacity onPress={function(){setAccepted(false);setSignModal(true);}} disabled={signing} activeOpacity={0.88} style={{borderRadius:R.xl,overflow:'hidden',opacity:signing?0.6:1}}>
              <LinearGradient colors={['#059669','#047857','#065F46']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:16,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:S.md}}>
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>{signing?'Signature en cours...':'Signer le contrat'}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={function(){setRejectModal(true);}} disabled={rejecting} style={{borderRadius:R.xl,padding:16,alignItems:'center',backgroundColor:'#FFF0F0',borderWidth:1,borderColor:'#DC262633',opacity:rejecting?0.6:1}}>
              <Text style={{fontSize:F.base,fontWeight:'700',color:'#DC2626'}}>{rejecting?'Refus en cours...':'Refuser le contrat'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions locataire SIGNED */}
        {isTenant && isSigned && (
          <View style={{gap:S.sm,marginBottom:S.lg}}>
            <TouchableOpacity onPress={handlePay} activeOpacity={0.88} style={{borderRadius:R.xl,overflow:'hidden'}}>
              <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:16,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:S.md}}>
                <Ionicons name="card-outline" size={20} color="#fff" />
                <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>Payer la caution — {contract.listing?fmtPrice(contract.listing.deposit||contract.listing.price):0} F</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReview} style={{borderRadius:R.xl,padding:16,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:S.md,backgroundColor:hasReview?'#F0FDF4':'#FFFBF0',borderWidth:1.5,borderColor:hasReview?'#059669':'#F59E0B'}}>
              <Ionicons name={hasReview?'star':'star-outline'} size={20} color={hasReview?'#059669':'#D97706'} />
              <Text style={{fontSize:F.base,fontWeight:'700',color:hasReview?'#059669':'#D97706'}}>{hasReview?'Avis déjà soumis':'Noter le propriétaire'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{height:20}} />
      </ScrollView>

      {/* Modal Signature */}
      <Modal visible={signModal} transparent animationType="slide" onRequestClose={function(){setSignModal(false);}}>
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'flex-end'}}>
          <View style={{backgroundColor:'#fff',borderTopLeftRadius:28,borderTopRightRadius:28,padding:S.xl}}>
            <View style={{width:40,height:4,backgroundColor:'#E0E0E0',borderRadius:2,alignSelf:'center',marginBottom:S.xl}} />
            <View style={{alignItems:'center',marginBottom:S.xl}}>
              <View style={{width:64,height:64,borderRadius:32,backgroundColor:'#D1FAE5',alignItems:'center',justifyContent:'center',marginBottom:S.md}}>
                <Ionicons name="document-text" size={32} color="#059669" />
              </View>
              <Text style={{fontSize:20,fontWeight:'900',color:'#1B4F3A',textAlign:'center'}}>Signature du contrat</Text>
              <Text style={{fontSize:F.sm,color:C.muted,marginTop:6,textAlign:'center'}}>Vous êtes sur le point de signer légalement ce contrat de location</Text>
            </View>
            <View style={{backgroundColor:'#F8FFF8',borderRadius:16,padding:S.lg,marginBottom:S.lg,borderWidth:1,borderColor:'#D1FAE5'}}>
              <Text style={{fontSize:F.xs,fontWeight:'900',color:'#059669',letterSpacing:1,marginBottom:S.md}}>RÉCAPITULATIF</Text>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                <Text style={{fontSize:F.sm,color:C.muted}}>Bien</Text>
                <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,flex:1,textAlign:'right'}} numberOfLines={1}>{contract.listing?contract.listing.title:'—'}</Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                <Text style={{fontSize:F.sm,color:C.muted}}>Loyer</Text>
                <Text style={{fontSize:F.sm,fontWeight:'700',color:'#1B4F3A'}}>{contract.listing?fmtPrice(contract.listing.price)+' FCFA/mois':'—'}</Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                <Text style={{fontSize:F.sm,color:C.muted}}>Caution</Text>
                <Text style={{fontSize:F.sm,fontWeight:'700',color:'#1B4F3A'}}>{contract.listing&&contract.listing.deposit?fmtPrice(contract.listing.deposit)+' FCFA':'1 mois'}</Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={{fontSize:F.sm,color:C.muted}}>Bailleur</Text>
                <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text}}>{contract.owner?contract.owner.firstName+' '+contract.owner.lastName:'—'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={function(){setAccepted(!accepted);}} style={{flexDirection:'row',alignItems:'flex-start',gap:S.md,marginBottom:S.xl}} activeOpacity={0.7}>
              <View style={{width:24,height:24,borderRadius:6,borderWidth:2,borderColor:accepted?'#059669':'#D1D5DB',backgroundColor:accepted?'#059669':'#fff',alignItems:'center',justifyContent:'center',marginTop:1,flexShrink:0}}>
                {accepted&&<Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={{fontSize:F.sm,color:C.text,flex:1,lineHeight:20}}>J'ai lu et j'accepte les termes et conditions de ce contrat de location. Je comprends que cette signature a valeur légale.</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={doSign} disabled={!accepted||signing} activeOpacity={0.88} style={{borderRadius:R.xl,overflow:'hidden',marginBottom:S.sm,opacity:(!accepted||signing)?0.4:1}}>
              <LinearGradient colors={['#059669','#047857']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:16,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:S.md}}>
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>Confirmer la signature</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={function(){setSignModal(false);}} style={{padding:14,alignItems:'center'}}>
              <Text style={{fontSize:F.base,color:C.muted,fontWeight:'600'}}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Refus */}
      <Modal visible={rejectModal} transparent animationType="slide" onRequestClose={function(){setRejectModal(false);}}>
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'flex-end'}}>
          <View style={{backgroundColor:'#fff',borderTopLeftRadius:28,borderTopRightRadius:28,padding:S.xl}}>
            <View style={{width:40,height:4,backgroundColor:'#E0E0E0',borderRadius:2,alignSelf:'center',marginBottom:S.xl}} />
            <View style={{alignItems:'center',marginBottom:S.xl}}>
              <View style={{width:64,height:64,borderRadius:32,backgroundColor:'#FEE2E2',alignItems:'center',justifyContent:'center',marginBottom:S.md}}>
                <Ionicons name="close-circle" size={32} color="#DC2626" />
              </View>
              <Text style={{fontSize:20,fontWeight:'900',color:'#DC2626',textAlign:'center'}}>Refuser le contrat</Text>
              <Text style={{fontSize:F.sm,color:C.muted,marginTop:6,textAlign:'center'}}>Cette action informera le propriétaire que vous refusez les conditions de location.</Text>
            </View>
            <View style={{backgroundColor:'#FEF2F2',borderRadius:16,padding:S.lg,marginBottom:S.xl,borderWidth:1,borderColor:'#FECACA'}}>
              <View style={{flexDirection:'row',alignItems:'flex-start',gap:S.sm}}>
                <Ionicons name="warning-outline" size={18} color="#DC2626" style={{marginTop:1}} />
                <Text style={{fontSize:F.sm,color:'#991B1B',flex:1,lineHeight:20}}>Une fois refusé, le propriétaire devra créer un nouveau contrat si vous souhaitez poursuivre la location.</Text>
              </View>
            </View>
            <TouchableOpacity onPress={doReject} disabled={rejecting} activeOpacity={0.88} style={{borderRadius:R.xl,backgroundColor:'#DC2626',paddingVertical:16,alignItems:'center',marginBottom:S.sm,opacity:rejecting?0.6:1}}>
              <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>Confirmer le refus</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={function(){setRejectModal(false);}} style={{padding:14,alignItems:'center'}}>
              <Text style={{fontSize:F.base,color:C.muted,fontWeight:'600'}}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}