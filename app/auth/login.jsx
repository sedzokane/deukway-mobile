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

export default function Login() {
  var auth = useAuth();
  var phoneS = useState(''); var phone = phoneS[0]; var setPhone = phoneS[1];
  var pwS = useState(''); var pw = pwS[0]; var setPw = pwS[1];
  var showS = useState(false); var show = showS[0]; var setShow = showS[1];

  function submit() {
    if (!phone) { Alert.alert('Requis','Entrez votre numéro de téléphone'); return; }
    authModule.authStore.login(phone, pw).catch(function() {
      Alert.alert('Erreur','Une erreur est survenue');
    });
  }

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
      <View style={{flex:1,backgroundColor:'#000'}}>
        <LinearGradient colors={['#1A0800','#3A1800','#D4821A']} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={{flex:1}}>
          <ScrollView contentContainerStyle={{paddingHorizontal:S.xl,paddingBottom:40}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={function(){router.back();}} style={{paddingTop:S.sm,marginBottom:S.xl}}>
              <Text style={{color:'rgba(255,255,255,0.8)',fontSize:F.md,fontWeight:'600'}}>‹  Retour</Text>
            </TouchableOpacity>
            <Text style={{fontSize:34,fontWeight:'900',color:'#fff',marginBottom:S.sm}}>Bon retour 👋</Text>
            <Text style={{fontSize:F.base,color:'rgba(255,255,255,0.6)',marginBottom:S.xl2}}>Connectez-vous à votre espace Deukway</Text>
            <View style={{backgroundColor:'#fff',borderRadius:R.xl2,padding:S.xl,elevation:16}}>
              <Text style={st.label}>Téléphone</Text>
              <TextInput style={st.input} placeholder="+221 77 000 0000" placeholderTextColor={C.gray} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <Text style={st.label}>Mot de passe</Text>
              <View style={{flexDirection:'row',alignItems:'center',backgroundColor:C.bg,borderRadius:R.lg,borderWidth:1,borderColor:C.border}}>
                <TextInput style={[st.input,{flex:1,borderWidth:0}]} placeholder="Mot de passe" placeholderTextColor={C.gray} value={pw} onChangeText={setPw} secureTextEntry={!show} />
                <TouchableOpacity onPress={function(){setShow(function(v){return !v;});}} style={{padding:S.sm}}>
                  <Text style={{fontSize:16}}>{show?'🙈':'👁️'}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{alignItems:'flex-end',marginTop:S.sm,marginBottom:S.xl}}>
                <Text style={{color:C.primary,fontSize:F.sm,fontWeight:'600'}}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submit} disabled={auth.isLoading} activeOpacity={0.88} style={{borderRadius:R.xl,overflow:'hidden',opacity:auth.isLoading?0.6:1}}>
                <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:17,alignItems:'center'}}>
                  <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>{auth.isLoading?'Connexion...':'Se connecter  →'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={function(){router.push('/auth/register');}} style={{alignItems:'center',marginTop:S.xl}}>
              <Text style={{color:'rgba(255,255,255,0.7)',fontSize:F.sm}}>Pas de compte ? <Text style={{color:C.primary,fontWeight:'800'}}>Créer un compte</Text></Text>
            </TouchableOpacity>
            <View style={{marginTop:S.xl,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:R.lg,padding:S.md}}>
              <Text style={{fontSize:F.xs,color:'rgba(255,255,255,0.6)',textAlign:'center'}}>Mode demo — N importe quel login fonctionne</Text>
              <Text style={{fontSize:F.xs,color:'rgba(255,255,255,0.6)',textAlign:'center',marginTop:3}}>Téléphone finissant par 0 = Propriétaire</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

var st = StyleSheet.create({
  label: {fontSize:14,fontWeight:'700',color:'#333333',marginBottom:6,marginTop:12},
  input: {backgroundColor:'#F5F5F5',borderRadius:14,paddingVertical:14,paddingHorizontal:16,fontSize:14,color:'#111111',borderWidth:1,borderColor:'#EBEBEB'},
});