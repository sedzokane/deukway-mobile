import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
var authModule = require('../../src/store/auth');
var hooks = require('../../src/store/hooks');
var useAuth = hooks.useAuth;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

export default function Otp() {
  var params = useLocalSearchParams(); var phone = params.phone || '';
  var auth = useAuth();
  var codeS = useState(['','','','','','']); var code = codeS[0]; var setCode = codeS[1];
  var timerS = useState(60); var timer = timerS[0]; var setTimer = timerS[1];
  var refs = useRef([]);

  useEffect(function() {
    setTimeout(function() { if(refs.current[0]) refs.current[0].focus(); }, 500);
    var t = setInterval(function() { setTimer(function(v) { return v>0?v-1:0; }); }, 1000);
    return function() { clearInterval(t); };
  }, []);

  function change(v, i) {
    var d = v.replace(/[^0-9]/g,'').slice(-1);
    var n = code.slice(); n[i]=d; setCode(n);
    if(d && i<5 && refs.current[i+1]) refs.current[i+1].focus();
  }
  function keyPress(key, i) {
    if(key==='Backspace' && !code[i] && i>0 && refs.current[i-1]) refs.current[i-1].focus();
  }
  function verify() {
    var full = code.join('');
    if(full.length<6) { Alert.alert('','Entrez les 6 chiffres'); return; }
    authModule.authStore.verifyOtp(phone, full).catch(function() {
      Alert.alert('Erreur','Code invalide');
      setCode(['','','','','','']);
      if(refs.current[0]) refs.current[0].focus();
    });
  }
  var done = code.every(function(d) { return d!==''; });

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
      <View style={{flex:1,backgroundColor:'#000'}}>
        <LinearGradient colors={['#1A0800','#3A1800','#D4821A']} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={{flex:1}}>
          <ScrollView contentContainerStyle={{paddingHorizontal:S.xl,paddingBottom:40}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={function(){router.back();}} style={{marginBottom:S.xl}}>
              <Text style={{color:'rgba(255,255,255,0.8)',fontSize:F.md,fontWeight:'600'}}>‹  Retour</Text>
            </TouchableOpacity>
            <View style={{alignItems:'center',marginBottom:S.xl}}>
              <View style={{width:80,height:80,borderRadius:40,backgroundColor:'rgba(212,130,26,0.2)',borderWidth:2,borderColor:C.primary,alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontSize:36}}>📱</Text>
              </View>
            </View>
            <Text style={{fontSize:26,fontWeight:'900',color:'#fff',textAlign:'center',marginBottom:S.sm}}>Vérification</Text>
            <Text style={{fontSize:F.base,color:'rgba(255,255,255,0.65)',textAlign:'center',marginBottom:S.xl2,lineHeight:24}}>
              Code envoyé au{'\n'}<Text style={{color:C.primary,fontWeight:'800'}}>{phone||'+221 XX XXX XXXX'}</Text>
            </Text>
            <View style={{backgroundColor:'#fff',borderRadius:R.xl2,padding:S.xl,elevation:16}}>
              <Text style={{fontSize:F.xs,fontWeight:'700',color:C.muted,textAlign:'center',marginBottom:S.xl,letterSpacing:1,textTransform:'uppercase'}}>Code à 6 chiffres</Text>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:S.xl}}>
                {code.map(function(d,i) {
                  return (
                    <TextInput key={i} ref={function(r){refs.current[i]=r;}}
                      style={{width:46,height:58,borderWidth:1.5,borderColor:d?C.primary:C.border,borderRadius:14,fontSize:24,fontWeight:'800',color:d?C.primary:C.text,backgroundColor:d?C.primaryLt:C.bg,textAlign:'center'}}
                      value={d} onChangeText={function(v){change(v,i);}}
                      onKeyPress={function(e){keyPress(e.nativeEvent.key,i);}}
                      keyboardType="number-pad" maxLength={1} />
                  );
                })}
              </View>
              <View style={{backgroundColor:C.primaryLt,borderRadius:R.lg,padding:S.sm,marginBottom:S.lg,alignItems:'center'}}>
                <Text style={{fontSize:F.xs,color:C.muted}}>Demo - Locataire: <Text style={{fontWeight:'800',color:C.primary}}>123456</Text>  Propriétaire: <Text style={{fontWeight:'800',color:C.owner}}>654321</Text></Text>
              </View>
              <TouchableOpacity onPress={verify} disabled={!done||auth.isLoading} style={{borderRadius:R.xl,overflow:'hidden',marginBottom:S.lg,opacity:done&&!auth.isLoading?1:0.45}}>
                <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:17,alignItems:'center'}}>
                  <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>{auth.isLoading?'Vérification...':'Valider le code  →'}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                <Text style={{color:C.muted,fontSize:F.sm}}>Pas reçu ? </Text>
                {timer>0?<Text style={{color:C.muted,fontSize:F.sm}}>Renvoyer dans {timer}s</Text>:<TouchableOpacity><Text style={{color:C.primary,fontWeight:'800',fontSize:F.sm}}>Renvoyer</Text></TouchableOpacity>}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}