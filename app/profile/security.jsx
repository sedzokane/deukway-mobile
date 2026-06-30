import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
var hooks = require('../../src/store/hooks');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var getToken = hooks.getToken;
var useAuth = hooks.useAuth;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

export default function SecurityScreen() {
  var auth = useAuth(); var user = auth.user;
  var oldPwS = useState(''); var oldPw = oldPwS[0]; var setOldPw = oldPwS[1];
  var newPwS = useState(''); var newPw = newPwS[0]; var setNewPw = newPwS[1];
  var confirmPwS = useState(''); var confirmPw = confirmPwS[0]; var setConfirmPw = confirmPwS[1];
  var loadingS = useState(false); var loading = loadingS[0]; var setLoading = loadingS[1];
  var showOldS = useState(false); var showOld = showOldS[0]; var setShowOld = showOldS[1];
  var showNewS = useState(false); var showNew = showNewS[0]; var setShowNew = showNewS[1];

  function handleChangePassword() {
    if (!oldPw || !newPw || !confirmPw) {
      Toast.show({ type:'error', text1:'Champs requis', text2:'Remplissez tous les champs', visibilityTime:2000 });
      return;
    }
    if (newPw.length < 6) {
      Toast.show({ type:'error', text1:'Mot de passe trop court', text2:'Minimum 6 caractères', visibilityTime:2000 });
      return;
    }
    if (newPw !== confirmPw) {
      Toast.show({ type:'error', text1:'Erreur', text2:'Les mots de passe ne correspondent pas', visibilityTime:2000 });
      return;
    }
    setLoading(true);
    api.patch('/users/password', { oldPassword: oldPw, newPassword: newPw }, getToken()).then(function() {
      setLoading(false);
      setOldPw(''); setNewPw(''); setConfirmPw('');
      Toast.show({ type:'success', text1:'Mot de passe modifié', visibilityTime:2000 });
    }).catch(function(err) {
      setLoading(false);
      Toast.show({ type:'error', text1:'Erreur', text2:'Mot de passe actuel incorrect', visibilityTime:2500 });
    });
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
      [
        { text:'Annuler', style:'cancel' },
        { text:'Supprimer', style:'destructive', onPress: function() {
          Toast.show({ type:'info', text1:'Fonctionnalité bientôt disponible', text2:'Contactez le support pour supprimer votre compte', visibilityTime:3000 });
        }},
      ]
    );
  }

  return (
    <View style={{flex:1,backgroundColor:'#F5F5F0'}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}} style={{width:36,height:36,borderRadius:18,backgroundColor:'rgba(255,255,255,0.15)',alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={{fontSize:18,fontWeight:'900',color:'#fff'}}>Sécurité</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg}}>

        {/* Info compte */}
        <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.lg,elevation:2}}>
          <Text style={{fontSize:F.xs,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.md}}>Connexion</Text>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <View style={{width:44,height:44,borderRadius:22,backgroundColor:C.primaryLt,alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="call" size={20} color={C.primary} />
            </View>
            <View style={{flex:1}}>
              <Text style={{fontSize:F.sm,color:C.muted}}>Numéro de téléphone</Text>
              <Text style={{fontSize:F.base,fontWeight:'700',color:C.text}}>{user?user.phone:''}</Text>
            </View>
          </View>
        </View>

        {/* Changer mot de passe */}
        <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.lg,elevation:2}}>
          <Text style={{fontSize:F.base,fontWeight:'900',color:C.text,marginBottom:S.md}}>Changer le mot de passe</Text>

          <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:6}}>Mot de passe actuel</Text>
          <View style={{flexDirection:'row',alignItems:'center',backgroundColor:C.bg,borderRadius:R.lg,borderWidth:1,borderColor:C.border,marginBottom:S.md}}>
            <TextInput
              style={{flex:1,padding:S.md,fontSize:F.sm,color:C.text}}
              placeholder="Mot de passe actuel"
              placeholderTextColor={C.gray}
              value={oldPw}
              onChangeText={setOldPw}
              secureTextEntry={!showOld}
            />
            <TouchableOpacity onPress={function(){setShowOld(!showOld);}} style={{padding:S.sm}}>
              <Text style={{fontSize:16}}>{showOld?'🙈':'👁️'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:6}}>Nouveau mot de passe</Text>
          <View style={{flexDirection:'row',alignItems:'center',backgroundColor:C.bg,borderRadius:R.lg,borderWidth:1,borderColor:C.border,marginBottom:S.md}}>
            <TextInput
              style={{flex:1,padding:S.md,fontSize:F.sm,color:C.text}}
              placeholder="Minimum 6 caractères"
              placeholderTextColor={C.gray}
              value={newPw}
              onChangeText={setNewPw}
              secureTextEntry={!showNew}
            />
            <TouchableOpacity onPress={function(){setShowNew(!showNew);}} style={{padding:S.sm}}>
              <Text style={{fontSize:16}}>{showNew?'🙈':'👁️'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:6}}>Confirmer le nouveau mot de passe</Text>
          <TextInput
            style={{backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,fontSize:F.sm,color:C.text,borderWidth:1,borderColor:C.border,marginBottom:S.lg}}
            placeholder="Confirmez"
            placeholderTextColor={C.gray}
            value={confirmPw}
            onChangeText={setConfirmPw}
            secureTextEntry
          />

          <TouchableOpacity onPress={handleChangePassword} disabled={loading} activeOpacity={0.88} style={{borderRadius:R.xl,overflow:'hidden',opacity:loading?0.6:1}}>
            <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:14,alignItems:'center'}}>
              <Text style={{fontSize:F.base,fontWeight:'800',color:'#fff'}}>{loading?'Modification...':'Modifier le mot de passe'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Confidentialité */}
        <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.lg,elevation:2}}>
          <Text style={{fontSize:F.xs,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.md}}>Confidentialité</Text>
          <TouchableOpacity onPress={function(){router.push('/legal/privacy');}} style={{flexDirection:'row',alignItems:'center',gap:S.md,paddingVertical:S.sm}}>
            <Ionicons name="lock-closed-outline" size={20} color={C.primary} />
            <Text style={{flex:1,fontSize:F.sm,color:C.text}}>Politique de confidentialité</Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
        </View>

        {/* Zone danger */}
        <View style={{backgroundColor:'#FEF2F2',borderRadius:R.xl,padding:S.lg,marginBottom:S.lg,borderWidth:1,borderColor:'#FECACA'}}>
          <Text style={{fontSize:F.xs,fontWeight:'800',color:'#DC2626',letterSpacing:1,textTransform:'uppercase',marginBottom:S.md}}>Zone de danger</Text>
          <TouchableOpacity onPress={handleDeleteAccount} style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
            <Text style={{flex:1,fontSize:F.sm,fontWeight:'700',color:'#DC2626'}}>Supprimer mon compte</Text>
            <Ionicons name="chevron-forward" size={16} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}