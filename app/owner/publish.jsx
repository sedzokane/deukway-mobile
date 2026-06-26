import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var TYPES = ['STUDIO','APARTMENT','ROOM','COLOCATION'];
var TYPE_LABELS = {STUDIO:'Studio',APARTMENT:'Appartement',ROOM:'Chambre',COLOCATION:'Colocation'};
var EQUIP = ['Meublé','Wifi','Électricité','Eau','Parking','Climatisation'];

export default function Publish() {
  var titleS = useState(''); var title = titleS[0]; var setTitle = titleS[1];
  var descS = useState(''); var desc = descS[0]; var setDesc = descS[1];
  var priceS = useState(''); var price = priceS[0]; var setPrice = priceS[1];
  var surfaceS = useState(''); var surface = surfaceS[0]; var setSurface = surfaceS[1];
  var cityS = useState('Dakar'); var city = cityS[0]; var setCity = cityS[1];
  var neighS = useState(''); var neigh = neighS[0]; var setNeigh = neighS[1];
  var typeS = useState('STUDIO'); var type = typeS[0]; var setType = typeS[1];
  var equipS = useState([]); var equip = equipS[0]; var setEquip = equipS[1];

  function toggleEquip(e) {
    setEquip(function(prev) {
      return prev.includes(e) ? prev.filter(function(x){return x!==e;}) : prev.concat(e);
    });
  }

  function handleSubmit() {
    if (!title||!price||!neigh) {
      Toast.show({type:'error',text1:'Champs requis',text2:'Titre, prix et quartier sont obligatoires',visibilityTime:2000});
      return;
    }
    Toast.show({type:'success',text1:'Annonce publiée !',text2:'Votre annonce est en cours de vérification',visibilityTime:3000});
  }

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
      <View style={{flex:1,backgroundColor:C.bg}}>
        <LinearGradient colors={['#0F2E22','#1B4F3A','#2D7A5F']} style={{paddingBottom:S.xl}}>
          <SafeAreaView edges={['top']} style={{paddingHorizontal:S.xl,paddingTop:S.sm}}>
            <Text style={{fontSize:22,fontWeight:'900',color:'#fff'}}>Publier une annonce</Text>
            <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)',marginTop:2}}>Remplissez les informations de votre bien</Text>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg}} keyboardShouldPersistTaps="handled">
          <Text style={st.section}>Type de logement</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:S.sm,marginBottom:S.xl}}>
            {TYPES.map(function(tp){
              return (
                <TouchableOpacity key={tp} onPress={function(){setType(tp);}} style={{paddingHorizontal:S.md,paddingVertical:9,borderRadius:R.full,borderWidth:1.5,borderColor:type===tp?C.owner:C.border,backgroundColor:type===tp?C.ownerLt:'#fff'}}>
                  <Text style={{fontSize:F.sm,fontWeight:'600',color:type===tp?C.owner:C.textMd}}>{TYPE_LABELS[tp]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={st.section}>Informations générales</Text>
          <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.xl,gap:S.md}}>
            <View>
              <Text style={st.label}>Titre *</Text>
              <TextInput style={st.input} placeholder="Ex: Studio meublé - Plateau" placeholderTextColor={C.gray} value={title} onChangeText={setTitle} />
            </View>
            <View>
              <Text style={st.label}>Description</Text>
              <TextInput style={[st.input,{height:100,textAlignVertical:'top'}]} placeholder="Décrivez votre bien..." placeholderTextColor={C.gray} value={desc} onChangeText={setDesc} multiline />
            </View>
            <View style={{flexDirection:'row',gap:S.sm}}>
              <View style={{flex:1}}>
                <Text style={st.label}>Prix (F/mois) *</Text>
                <TextInput style={st.input} placeholder="120000" placeholderTextColor={C.gray} value={price} onChangeText={setPrice} keyboardType="numeric" />
              </View>
              <View style={{flex:1}}>
                <Text style={st.label}>Surface (m²)</Text>
                <TextInput style={st.input} placeholder="32" placeholderTextColor={C.gray} value={surface} onChangeText={setSurface} keyboardType="numeric" />
              </View>
            </View>
          </View>

          <Text style={st.section}>Localisation</Text>
          <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.xl,gap:S.md}}>
            <View>
              <Text style={st.label}>Ville</Text>
              <TextInput style={st.input} placeholder="Dakar" placeholderTextColor={C.gray} value={city} onChangeText={setCity} />
            </View>
            <View>
              <Text style={st.label}>Quartier *</Text>
              <TextInput style={st.input} placeholder="Ex: Plateau, Mermoz, Almadies..." placeholderTextColor={C.gray} value={neigh} onChangeText={setNeigh} />
            </View>
          </View>

          <Text style={st.section}>Équipements</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:S.sm,marginBottom:S.xl}}>
            {EQUIP.map(function(e){
              var active = equip.includes(e);
              return (
                <TouchableOpacity key={e} onPress={function(){toggleEquip(e);}} style={{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:S.md,paddingVertical:9,borderRadius:R.full,borderWidth:1.5,borderColor:active?C.owner:C.border,backgroundColor:active?C.ownerLt:'#fff'}}>
                  <Ionicons name={active?'checkmark-circle':'ellipse-outline'} size={16} color={active?C.owner:C.gray} />
                  <Text style={{fontSize:F.sm,fontWeight:'600',color:active?C.owner:C.textMd}}>{e}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.88} style={{borderRadius:R.xl,overflow:'hidden',marginBottom:S.xl}}>
            <LinearGradient colors={['#2D7A5F','#1B4F3A','#0F2E22']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:17,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:S.md}}>
              <Ionicons name="cloud-upload" size={20} color="#fff" />
              <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>Publier l annonce</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

var st = StyleSheet.create({
  section: {fontSize:F.xs,fontWeight:'800',color:'#888888',letterSpacing:1.2,textTransform:'uppercase',marginBottom:S.md},
  label: {fontSize:12,fontWeight:'700',color:'#333333',marginBottom:6},
  input: {backgroundColor:'#F5F5F5',borderRadius:14,paddingVertical:14,paddingHorizontal:16,fontSize:14,color:'#111111',borderWidth:1,borderColor:'#EBEBEB'},
});