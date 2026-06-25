import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
var authModule = require('../../src/store/auth');
var hooks = require('../../src/store/hooks');
var useAuth = hooks.useAuth;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

export default function Register() {
  var auth = useAuth();
  var roleS = useState('TENANT'); var role = roleS[0]; var setRole = roleS[1];
  var fnS = useState(''); var fn = fnS[0]; var setFn = fnS[1];
  var lnS = useState(''); var ln = lnS[0]; var setLn = lnS[1];
  var phS = useState(''); var ph = phS[0]; var setPh = phS[1];
  var pwS = useState(''); var pw = pwS[0]; var setPw = pwS[1];
  var isOwner = role==='OWNER';
  var color = isOwner?C.owner:C.primary;
  var grad = isOwner?['#0F2E22','#1B4F3A','#2D7A5F']:['#1A0800','#3A1800','#D4821A'];

  function submit() {
    if(!fn||!ph) { Alert.alert('Requis','Prénom et téléphone obligatoires'); return; }
    authModule.authStore.register({firstName:fn,lastName:ln,phone:ph,password:pw,role:role}).then(function() {
      router.push({pathname:'/auth/otp',params:{phone:ph}});
    }).catch(function() { Alert.alert('Erreur','Une erreur est survenue'); });
  }

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
      <SafeAreaView style={{flex:1,backgroundColor:'#fff'}}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <LinearGradient colors={grad} style={{padding:S.xl,paddingBottom:S.xl2}}>
            <TouchableOpacity onPress={function(){router.back();}} style={{marginBottom:S.xl}}>
              <Text style={{color:'rgba(255,255,255,0.85)',fontSize:F.md,fontWeight:'600'}}>‹  Retour</Text>
            </TouchableOpacity>
            <Text style={{fontSize:26,fontWeight:'900',color:'#fff',marginTop:S.sm}}>Créer un compte</Text>
            <Text style={{fontSize:F.base,color:'rgba(255,255,255,0.7)',marginTop:4}}>Rejoignez Deukway aujourd hui</Text>
          </LinearGradient>
          <View style={{padding:S.xl}}>
            <Text style={st.sectionLbl}>Je suis</Text>
            <View style={{flexDirection:'row',gap:12}}>
              {['TENANT','OWNER'].map(function(r) {
                var active = role===r;
                var c = r==='OWNER'?C.owner:C.primary;
                var bg = r==='OWNER'?C.ownerLt:C.primaryLt;
                return (
                  <TouchableOpacity key={r} onPress={function(){setRole(r);}} activeOpacity={0.85}
                    style={{flex:1,borderWidth:1.5,borderColor:active?c:C.border,borderRadius:R.xl,padding:S.lg,alignItems:'center',gap:S.sm,position:'relative',backgroundColor:active?bg:'#fff'}}>
                    <Text style={{fontSize:28}}>{r==='TENANT'?'🏘️':'🏠'}</Text>
                    <Text style={{fontSize:F.md,fontWeight:'800',color:active?c:C.text}}>{r==='TENANT'?'Locataire':'Propriétaire'}</Text>
                    <Text style={{fontSize:F.xs,color:C.muted,textAlign:'center'}}>{r==='TENANT'?'Je cherche un logement':'Je propose un bien'}</Text>
                    {active&&<View style={{position:'absolute',top:10,right:10,width:22,height:22,borderRadius:11,backgroundColor:c,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#fff',fontSize:12,fontWeight:'800'}}>✓</Text></View>}
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[st.sectionLbl,{marginTop:S.xl}]}>Informations</Text>
            <View style={{flexDirection:'row',gap:10}}>
              <View style={{flex:1}}>
                <Text style={st.label}>Prénom *</Text>
                <TextInput style={st.input} placeholder="Mamadou" placeholderTextColor={C.gray} value={fn} onChangeText={setFn} />
              </View>
              <View style={{flex:1}}>
                <Text style={st.label}>Nom</Text>
                <TextInput style={st.input} placeholder="Fall" placeholderTextColor={C.gray} value={ln} onChangeText={setLn} />
              </View>
            </View>
            <Text style={st.label}>Téléphone *</Text>
            <TextInput style={st.input} placeholder="+221 77 000 0000" placeholderTextColor={C.gray} value={ph} onChangeText={setPh} keyboardType="phone-pad" />
            <Text style={st.label}>Mot de passe</Text>
            <TextInput style={st.input} placeholder="Minimum 8 caractères" placeholderTextColor={C.gray} value={pw} onChangeText={setPw} secureTextEntry />
            <TouchableOpacity onPress={submit} disabled={auth.isLoading} activeOpacity={0.88}
              style={{borderRadius:R.xl,paddingVertical:17,alignItems:'center',marginTop:S.xl,backgroundColor:color,opacity:auth.isLoading?0.6:1}}>
              <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>{auth.isLoading?'Création...':'Créer mon compte  →'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={function(){router.push('/auth/login');}} style={{alignItems:'center',paddingVertical:S.xl}}>
              <Text style={{color:C.muted,fontSize:F.sm}}>Déjà un compte ? <Text style={{color:color,fontWeight:'800'}}>Se connecter</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

var st = StyleSheet.create({
  sectionLbl: {fontSize:11,fontWeight:'800',color:'#888888',letterSpacing:1.2,textTransform:'uppercase',marginBottom:12},
  label: {fontSize:12,fontWeight:'700',color:'#333333',marginBottom:6,marginTop:12},
  input: {backgroundColor:'#F5F5F5',borderRadius:14,paddingVertical:14,paddingHorizontal:16,fontSize:14,color:'#111111',borderWidth:1,borderColor:'#EBEBEB'},
});