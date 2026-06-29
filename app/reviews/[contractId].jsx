import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
var hooks = require('../../src/store/hooks');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

export default function ReviewScreen() {
  var params = useLocalSearchParams();
  var contractId = params.contractId;
  var ownerName = params.ownerName || 'le proprietaire';
  var listingTitle = params.listingTitle || 'ce logement';

  var ratingS = useState(0); var rating = ratingS[0]; var setRating = ratingS[1];
  var commentS = useState(''); var comment = commentS[0]; var setComment = commentS[1];
  var loadingS = useState(false); var loading = loadingS[0]; var setLoading = loadingS[1];
  var existingS = useState(null); var existing = existingS[0]; var setExisting = existingS[1];

  useEffect(function() {
    api.get('/reviews/contract/'+contractId, getToken()).then(function(data) {
      if (data && data.id) setExisting(data);
    }).catch(function(){});
  }, [contractId]);

  function handleSubmit() {
    if (rating === 0) {
      Toast.show({ type:'error', text1:'Note requise', text2:'Choisissez une note de 1 à 5', visibilityTime:2000 });
      return;
    }
    setLoading(true);
    api.post('/reviews/contract/'+contractId, { rating: rating, comment: comment }, getToken()).then(function() {
      setLoading(false);
      Toast.show({ type:'success', text1:'Merci pour votre avis !', text2:'Votre note a été enregistrée', visibilityTime:2500 });
      setTimeout(function() { router.back(); }, 2500);
    }).catch(function(err) {
      setLoading(false);
      Toast.show({ type:'error', text1:'Erreur', text2:'Impossible d\'envoyer la note', visibilityTime:2000 });
    });
  }

  var labels = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'];
  var colors = ['', '#DC2626', '#F59E0B', '#3B82F6', '#059669', '#059669'];

  return (
    <View style={{flex:1,backgroundColor:'#F5F5F0'}}>
      <LinearGradient colors={['#0A1F15','#1B4F3A','#2D7A5F']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}} style={{width:36,height:36,borderRadius:18,backgroundColor:'rgba(255,255,255,0.15)',alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={{fontSize:18,fontWeight:'900',color:'#fff'}}>Laisser un avis</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={{padding:S.lg}}>

        {existing ? (
          <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.xl,alignItems:'center',elevation:3}}>
            <View style={{width:64,height:64,borderRadius:32,backgroundColor:'#D1FAE5',alignItems:'center',justifyContent:'center',marginBottom:S.lg}}>
              <Ionicons name="checkmark-circle" size={32} color="#059669" />
            </View>
            <Text style={{fontSize:F.lg,fontWeight:'900',color:C.text,marginBottom:S.sm}}>Avis déjà soumis</Text>
            <View style={{flexDirection:'row',gap:4,marginBottom:S.md}}>
              {[1,2,3,4,5].map(function(s) {
                return <Ionicons key={s} name={s<=existing.rating?'star':'star-outline'} size={28} color="#F59E0B" />;
              })}
            </View>
            {existing.comment&&<Text style={{fontSize:F.sm,color:C.muted,textAlign:'center',fontStyle:'italic'}}>"{existing.comment}"</Text>}
          </View>
        ) : (
          <View>
            {/* Info bien */}
            <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.lg,elevation:2}}>
              <Text style={{fontSize:F.xs,color:C.muted,marginBottom:4}}>Vous notez</Text>
              <Text style={{fontSize:F.base,fontWeight:'800',color:C.text}}>{ownerName}</Text>
              <Text style={{fontSize:F.sm,color:C.muted}}>{listingTitle}</Text>
            </View>

            {/* Étoiles */}
            <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.xl,marginBottom:S.lg,alignItems:'center',elevation:2}}>
              <Text style={{fontSize:F.sm,fontWeight:'700',color:C.muted,marginBottom:S.lg}}>Quelle est votre note ?</Text>
              <View style={{flexDirection:'row',gap:S.md,marginBottom:S.md}}>
                {[1,2,3,4,5].map(function(s) {
                  return (
                    <TouchableOpacity key={s} onPress={function(){setRating(s);}} activeOpacity={0.7}>
                      <Ionicons name={s<=rating?'star':'star-outline'} size={44} color={s<=rating?'#F59E0B':'#D1D5DB'} />
                    </TouchableOpacity>
                  );
                })}
              </View>
              {rating>0&&(
                <View style={{backgroundColor:colors[rating]+'22',borderRadius:R.full,paddingHorizontal:S.lg,paddingVertical:6}}>
                  <Text style={{fontSize:F.sm,fontWeight:'700',color:colors[rating]}}>{labels[rating]}</Text>
                </View>
              )}
            </View>

            {/* Commentaire */}
            <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.lg,elevation:2}}>
              <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:S.md}}>Commentaire (optionnel)</Text>
              <TextInput
                style={{backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,fontSize:F.sm,color:C.text,borderWidth:1,borderColor:C.border,minHeight:100,textAlignVertical:'top'}}
                placeholder="Partagez votre expérience avec ce propriétaire..."
                placeholderTextColor={C.gray}
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={500}
              />
              <Text style={{fontSize:F.xs,color:C.gray,textAlign:'right',marginTop:4}}>{comment.length}/500</Text>
            </View>

            {/* Bouton soumettre */}
            <TouchableOpacity onPress={handleSubmit} disabled={loading||rating===0} activeOpacity={0.88} style={{borderRadius:R.xl,overflow:'hidden',opacity:(loading||rating===0)?0.5:1}}>
              <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:16,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:S.md}}>
                <Ionicons name="star" size={20} color="#fff" />
                <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>{loading?'Envoi...':'Soumettre mon avis'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}