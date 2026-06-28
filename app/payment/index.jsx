import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, Image, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
var hooks = require('../../src/store/hooks');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var METHODS = [
  {id:'wave',label:'Wave',logo:require('../../assets/logos/wave.png'),color:'#1AC9E6',desc:'Payer via Wave Senegal',type:'phone'},
  {id:'orange',label:'Orange Money',logo:require('../../assets/logos/orange.png'),color:'#FF6600',desc:'Payer via Orange Money',type:'phone'},
  {id:'free',label:'Free Money',logo:require('../../assets/logos/free.png'),color:'#E2001A',desc:'Payer via Free Money',type:'phone'},
  {id:'emoney',label:'E-Money',logo:require('../../assets/logos/emoney.png'),color:'#7B68EE',desc:'Payer via E-Money (Expresso)',type:'phone'},
  {id:'card',label:'Carte Bancaire',logo:null,color:'#6366F1',desc:'Visa / Mastercard',type:'card'},
];

function fmt(p) { return new Intl.NumberFormat('fr-SN').format(p); }

export default function Payment() {
  var params = useLocalSearchParams();
  var amount = parseInt(params.amount || '0');
  var description = params.description || 'Paiement Deukway';
  var selectedS = useState(null); var selected = selectedS[0]; var setSelected = selectedS[1];
  var loadingS = useState(false); var loading = loadingS[0]; var setLoading = loadingS[1];
  var modalS = useState(false); var modal = modalS[0]; var setModal = modalS[1];
  var phoneS = useState(''); var phone = phoneS[0]; var setPhone = phoneS[1];
  var cardNumS = useState(''); var cardNum = cardNumS[0]; var setCardNum = cardNumS[1];
  var cardExpS = useState(''); var cardExp = cardExpS[0]; var setCardExp = cardExpS[1];
  var cardCvvS = useState(''); var cardCvv = cardCvvS[0]; var setCardCvv = cardCvvS[1];
  var cardNameS = useState(''); var cardName = cardNameS[0]; var setCardName = cardNameS[1];

  var selectedMethod = METHODS.find(function(m){ return m.id === selected; });

  function handleSelectMethod(m) {
    setSelected(m.id);
    setPhone('');
    setCardNum(''); setCardExp(''); setCardCvv(''); setCardName('');
    setModal(true);
  }

  function formatCard(val) {
    var digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function formatExp(val) {
    var digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0,2) + '/' + digits.slice(2);
    return digits;
  }

  function validateAndPay() {
    if (!selectedMethod) return;
    if (selectedMethod.type === 'phone') {
      if (!phone || phone.length < 9) {
        Alert.alert('Erreur', 'Entrez un numero de telephone valide (9 chiffres minimum)');
        return;
      }
    } else {
      if (!cardName) { Alert.alert('Erreur', 'Entrez le nom sur la carte'); return; }
      if (!cardNum || cardNum.replace(/\s/g,'').length < 16) { Alert.alert('Erreur', 'Entrez un numero de carte valide (16 chiffres)'); return; }
      if (!cardExp || cardExp.length < 5) { Alert.alert('Erreur', 'Entrez une date d expiration valide (MM/AA)'); return; }
      if (!cardCvv || cardCvv.length < 3) { Alert.alert('Erreur', 'Entrez un CVV valide (3 chiffres)'); return; }
    }
    setModal(false);
    setLoading(true);
    api.post('/payments/invoice', {
      amount: amount,
      description: description,
      returnUrl: 'https://deukway-backend-production.up.railway.app/api/payments/success',
      channel: selected,
    }, getToken()).then(function(data) {
      setLoading(false);
      if (data && data.response_text && data.response_text.startsWith('http')) {
        var url = data.response_text;
        if (typeof window !== 'undefined') {
          window.open(url, '_blank');
        } else {
          Linking.openURL(url);
        }
      } else {
        Alert.alert('Erreur', 'Reponse: ' + JSON.stringify(data));
      }
    }).catch(function() {
      setLoading(false);
      Alert.alert('Erreur', 'Impossible de creer le paiement');
    });
  }

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={{fontSize:20,fontWeight:'900',color:'#fff'}}>Paiement</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg}}>
        <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.xl,alignItems:'center'}}>
          <Text style={{fontSize:F.sm,color:C.muted,marginBottom:4}}>Montant a payer</Text>
          <Text style={{fontSize:36,fontWeight:'900',color:C.primary}}>{fmt(amount)} F</Text>
          <Text style={{fontSize:F.sm,color:C.muted,marginTop:4}}>{description}</Text>
        </View>

        <Text style={{fontSize:F.xs,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.md}}>Methode de paiement</Text>

        <View style={{gap:S.sm,marginBottom:S.xl}}>
          {METHODS.map(function(m) {
            var active = selected === m.id;
            return (
              <TouchableOpacity key={m.id} onPress={function(){handleSelectMethod(m);}} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,flexDirection:'row',alignItems:'center',gap:S.md,borderWidth:2,borderColor:active?C.primary:'transparent',elevation:active?4:2}} activeOpacity={0.85}>
                {m.logo
                  ? <Image source={m.logo} style={{width:48,height:48,borderRadius:12}} resizeMode="contain" />
                  : <View style={{width:48,height:48,borderRadius:12,backgroundColor:m.color+'22',alignItems:'center',justifyContent:'center'}}>
                      <Ionicons name="card" size={24} color={m.color} />
                    </View>
                }
                <View style={{flex:1}}>
                  <Text style={{fontSize:F.base,fontWeight:'700',color:C.text}}>{m.label}</Text>
                  <Text style={{fontSize:F.xs,color:C.muted}}>{m.desc}</Text>
                </View>
                <View style={{width:22,height:22,borderRadius:11,borderWidth:2,borderColor:active?C.primary:C.border,backgroundColor:active?C.primary:'#fff',alignItems:'center',justifyContent:'center'}}>
                  {active&&<View style={{width:8,height:8,borderRadius:4,backgroundColor:'#fff'}} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={function(){if(selected){setModal(true);}else{Alert.alert('Requis','Choisissez une methode de paiement');}}} disabled={loading||!selected} activeOpacity={0.88} style={{borderRadius:R.xl,overflow:'hidden',opacity:(loading||!selected)?0.6:1}}>
          <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:16,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:S.md}}>
            <Ionicons name="card" size={20} color="#fff" />
            <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>{loading?'Traitement...':'Payer maintenant'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={{textAlign:'center',fontSize:F.xs,color:C.muted,marginTop:S.lg}}>🔒 Paiement securise par PayDunya</Text>
      </ScrollView>

      <Modal visible={modal} transparent animationType="slide" onRequestClose={function(){setModal(false);}}>
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
          <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'}}>
            <View style={{backgroundColor:'#fff',borderTopLeftRadius:R.xl2,borderTopRightRadius:R.xl2,padding:S.xl}}>
              <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:S.xl}}>
                <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
                  {selectedMethod&&selectedMethod.logo&&<Image source={selectedMethod.logo} style={{width:32,height:32,borderRadius:8}} resizeMode="contain" />}
                  <Text style={{fontSize:F.lg,fontWeight:'900',color:C.text}}>{selectedMethod?selectedMethod.label:''}</Text>
                </View>
                <TouchableOpacity onPress={function(){setModal(false);}}>
                  <Ionicons name="close" size={24} color={C.gray} />
                </TouchableOpacity>
              </View>

              {selectedMethod && selectedMethod.type === 'phone' && (
                <View style={{gap:S.md}}>
                  <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text}}>Numero de telephone</Text>
                  <View style={{flexDirection:'row',alignItems:'center',backgroundColor:C.bg,borderRadius:R.lg,borderWidth:1.5,borderColor:C.border,paddingHorizontal:S.md}}>
                    <Text style={{fontSize:F.base,color:C.muted,marginRight:S.sm,fontWeight:'700'}}>+221</Text>
                    <TextInput
                      style={{flex:1,paddingVertical:14,fontSize:F.base,color:C.text}}
                      placeholder="77 000 00 00"
                      placeholderTextColor={C.gray}
                      value={phone}
                      onChangeText={function(v){setPhone(v.replace(/\D/g,''));}}
                      keyboardType="phone-pad"
                      maxLength={9}
                    />
                  </View>
                  <Text style={{fontSize:F.xs,color:C.muted}}>Entrez votre numero {selectedMethod?selectedMethod.label:''} pour confirmer le paiement de {fmt(amount)} F</Text>
                </View>
              )}

              {selectedMethod && selectedMethod.type === 'card' && (
                <View style={{gap:S.md}}>
                  <View>
                    <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:6}}>Nom sur la carte</Text>
                    <TextInput style={{backgroundColor:C.bg,borderRadius:R.lg,borderWidth:1.5,borderColor:C.border,paddingHorizontal:S.md,paddingVertical:14,fontSize:F.base,color:C.text}} placeholder="SEYDOU KANE" placeholderTextColor={C.gray} value={cardName} onChangeText={setCardName} autoCapitalize="characters" />
                  </View>
                  <View>
                    <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:6}}>Numero de carte</Text>
                    <TextInput style={{backgroundColor:C.bg,borderRadius:R.lg,borderWidth:1.5,borderColor:C.border,paddingHorizontal:S.md,paddingVertical:14,fontSize:F.base,color:C.text,letterSpacing:2}} placeholder="0000 0000 0000 0000" placeholderTextColor={C.gray} value={cardNum} onChangeText={function(v){setCardNum(formatCard(v));}} keyboardType="numeric" maxLength={19} />
                  </View>
                  <View style={{flexDirection:'row',gap:S.md}}>
                    <View style={{flex:1}}>
                      <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:6}}>Expiration</Text>
                      <TextInput style={{backgroundColor:C.bg,borderRadius:R.lg,borderWidth:1.5,borderColor:C.border,paddingHorizontal:S.md,paddingVertical:14,fontSize:F.base,color:C.text}} placeholder="MM/AA" placeholderTextColor={C.gray} value={cardExp} onChangeText={function(v){setCardExp(formatExp(v));}} keyboardType="numeric" maxLength={5} />
                    </View>
                    <View style={{flex:1}}>
                      <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:6}}>CVV</Text>
                      <TextInput style={{backgroundColor:C.bg,borderRadius:R.lg,borderWidth:1.5,borderColor:C.border,paddingHorizontal:S.md,paddingVertical:14,fontSize:F.base,color:C.text}} placeholder="•••" placeholderTextColor={C.gray} value={cardCvv} onChangeText={function(v){setCardCvv(v.replace(/\D/g,''));}} keyboardType="numeric" maxLength={3} secureTextEntry />
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity onPress={validateAndPay} style={{borderRadius:R.xl,overflow:'hidden',marginTop:S.xl}}>
                <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:16,alignItems:'center'}}>
                  <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>Confirmer — {fmt(amount)} F</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}