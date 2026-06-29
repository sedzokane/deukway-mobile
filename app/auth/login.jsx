import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
var React = require('react');
var authModule = require('../../src/store/auth');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var hooks = require('../../src/store/hooks');
var useAuth = hooks.useAuth;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

WebBrowser.maybeCompleteAuthSession();

var GOOGLE_CLIENT_ID = '862858555487-4uh6j1v8jpho756srojuuatkum0s5q0d.apps.googleusercontent.com';

export default function Login() {
  var auth = useAuth();
  var phoneS = useState(''); var phone = phoneS[0]; var setPhone = phoneS[1];
  var pwS = useState(''); var pw = pwS[0]; var setPw = pwS[1];
  var showS = useState(false); var show = showS[0]; var setShow = showS[1];
  var googleLoadingS = useState(false); var googleLoading = googleLoadingS[0]; var setGoogleLoading = googleLoadingS[1];

  var googleAuth = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: makeRedirectUri({
      scheme: 'deukway',
      preferLocalhost: true,
    }),
    scopes: ['openid', 'profile', 'email'],
  });
  var request = googleAuth[0];
  var response = googleAuth[1];
  var promptAsync = googleAuth[2];

  React.useEffect(function() {
    if (response && response.type === 'success') {
      var token = response.authentication ? response.authentication.accessToken : null;
      if (token) {
        setGoogleLoading(true);
        api.post('/auth/google', { token: token }, null).then(function(data) {
          setGoogleLoading(false);
          if (data && data.token) {
            authModule.authStore.setFromGoogle(data);
          } else {
            Alert.alert('Erreur', 'Connexion Google echouee: ' + JSON.stringify(data));
          }
        }).catch(function(err) {
          setGoogleLoading(false);
          Alert.alert('Erreur', 'Connexion Google echouee');
        });
      }
    } else if (response && response.type === 'error') {
      console.log('Google error:', JSON.stringify(response));
    }
  }, [response]);

  function handlePhone(text) {
    var clean = text.replace(/[^0-9+]/g,'');
    setPhone(clean);
  }

  function submit() {
    if (!phone) { Alert.alert('Requis','Entrez votre numéro de téléphone'); return; }
    if (!pw) { Alert.alert('Requis','Entrez votre mot de passe'); return; }
    authModule.authStore.login(phone, pw).catch(function(err) {
      Alert.alert('Erreur', typeof err === 'string' ? err : 'Identifiants incorrects');
    });
  }

  function handleGoogle() {
    if (request) {
      promptAsync();
    } else {
      Alert.alert('Erreur', 'Google Auth non disponible');
    }
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
              <TextInput style={st.input} placeholder="+221770000000" placeholderTextColor={C.gray} value={phone} onChangeText={handlePhone} keyboardType="phone-pad" />

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

              <TouchableOpacity onPress={submit} disabled={auth.isLoading} activeOpacity={0.88} style={{borderRadius:R.xl,overflow:'hidden',opacity:auth.isLoading?0.6:1,marginBottom:S.lg}}>
                <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:17,alignItems:'center'}}>
                  <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>{auth.isLoading?'Connexion...':'Se connecter  →'}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Séparateur */}
              <View style={{flexDirection:'row',alignItems:'center',gap:S.md,marginBottom:S.lg}}>
                <View style={{flex:1,height:0.5,backgroundColor:C.border}} />
                <Text style={{fontSize:F.xs,color:C.muted,fontWeight:'600'}}>OU</Text>
                <View style={{flex:1,height:0.5,backgroundColor:C.border}} />
              </View>

              {/* Bouton Google */}
              <TouchableOpacity onPress={handleGoogle} disabled={googleLoading} activeOpacity={0.88} style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:S.md,borderRadius:R.xl,padding:15,borderWidth:1.5,borderColor:'#E0E0E0',backgroundColor:'#fff',elevation:2,opacity:googleLoading?0.6:1}}>
                <Image source={require('../../assets/logos/google.png')} style={{width:22,height:22}} resizeMode="contain" />
                <Text style={{fontSize:F.base,fontWeight:'700',color:'#333'}}>{googleLoading?'Connexion en cours...':'Continuer avec Google'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={function(){router.push('/auth/register');}} style={{alignItems:'center',marginTop:S.xl}}>
              <Text style={{color:'rgba(255,255,255,0.7)',fontSize:F.sm}}>Pas de compte ? <Text style={{color:C.primary,fontWeight:'800'}}>Créer un compte</Text></Text>
            </TouchableOpacity>
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