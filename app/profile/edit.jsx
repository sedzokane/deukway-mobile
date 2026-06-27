import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
var hooks = require('../../src/store/hooks');
var authModule = require('../../src/store/auth');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var BASE_URL = apiModule.BASE_URL;
var useAuth = hooks.useAuth;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

export default function EditProfile() {
  var auth = useAuth(); var user = auth.user;
  var firstS = useState(user?user.firstName:''); var first = firstS[0]; var setFirst = firstS[1];
  var lastS = useState(user?user.lastName:''); var last = lastS[0]; var setLast = lastS[1];
  var emailS = useState(user?user.email||'':''); var email = emailS[0]; var setEmail = emailS[1];
  var cityS = useState(user?user.city||'':''); var city = cityS[0]; var setCity = cityS[1];
  var avatarS = useState(user?user.avatar||null:null); var avatar = avatarS[0]; var setAvatar = avatarS[1];
  var loadingS = useState(false); var loading = loadingS[0]; var setLoading = loadingS[1];

  function pickAvatar() {
    if (typeof document !== 'undefined') {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var url = URL.createObjectURL(file);
        setAvatar(url);
        var formData = new FormData();
        formData.append('file', file);
        fetch(BASE_URL + '/media/avatar', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + getToken(), 'ngrok-skip-browser-warning': 'true' },
          body: formData,
        }).then(function(r) { return r.json(); }).then(function(data) {
          if (data.url) setAvatar(data.url);
        });
      };
      input.click();
    } else {
      ImagePicker.launchImageLibraryAsync({ quality: 0.8 }).then(function(result) {
        if (!result.canceled) {
          var asset = result.assets[0];
          setAvatar(asset.uri);
          var formData = new FormData();
          formData.append('file', { uri: asset.uri, type: 'image/jpeg', name: 'avatar.jpg' });
          fetch(BASE_URL + '/media/avatar', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken(), 'ngrok-skip-browser-warning': 'true' },
            body: formData,
          }).then(function(r) { return r.json(); }).then(function(data) {
            if (data.url) setAvatar(data.url);
          });
        }
      });
    }
  }

  function handleSave() {
    if (!first || !last) {
      Alert.alert('Requis','Prenom et nom sont obligatoires');
      return;
    }
    setLoading(true);
    api.patch('/users/profile', {
      firstName: first,
      lastName: last,
      email: email,
      city: city,
      avatar: avatar,
    }, getToken()).then(function(data) {
      setLoading(false);
      authModule.authStore.setUser(data);
      Toast.show({ type:'success', text1:'Profil mis a jour', visibilityTime:2000 });
      router.back();
    }).catch(function() {
      setLoading(false);
      Alert.alert('Erreur','Impossible de mettre a jour le profil');
    });
  }

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
      <View style={{flex:1,backgroundColor:C.bg}}>
        <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
          <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
            <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
              <TouchableOpacity onPress={function(){router.back();}}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={{fontSize:20,fontWeight:'900',color:'#fff'}}>Modifier le profil</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg}} keyboardShouldPersistTaps="handled">
          <View style={{alignItems:'center',marginBottom:S.xl}}>
            <TouchableOpacity onPress={pickAvatar} style={{position:'relative'}}>
              {avatar
                ? <Image source={{uri:avatar}} style={{width:100,height:100,borderRadius:50,borderWidth:3,borderColor:C.primary}} />
                : <LinearGradient colors={['#F0A830','#D4821A']} style={{width:100,height:100,borderRadius:50,alignItems:'center',justifyContent:'center',borderWidth:3,borderColor:C.primary}}>
                    <Text style={{fontSize:32,fontWeight:'900',color:'#fff'}}>{first?first[0]:''}</Text>
                  </LinearGradient>
              }
              <View style={{position:'absolute',bottom:0,right:0,width:32,height:32,borderRadius:16,backgroundColor:C.primary,alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:'#fff'}}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={{fontSize:F.sm,color:C.muted,marginTop:S.sm}}>Appuyer pour changer la photo</Text>
          </View>

          <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.lg,gap:S.md}}>
            <Text style={{fontSize:F.xs,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>Informations personnelles</Text>
            <View>
              <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:6}}>Prenom</Text>
              <TextInput style={{backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,fontSize:F.base,color:C.text,borderWidth:1,borderColor:C.border}} value={first} onChangeText={setFirst} placeholder="Votre prenom" placeholderTextColor={C.gray} />
            </View>
            <View>
              <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:6}}>Nom</Text>
              <TextInput style={{backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,fontSize:F.base,color:C.text,borderWidth:1,borderColor:C.border}} value={last} onChangeText={setLast} placeholder="Votre nom" placeholderTextColor={C.gray} />
            </View>
            <View>
              <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:6}}>Email</Text>
              <TextInput style={{backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,fontSize:F.base,color:C.text,borderWidth:1,borderColor:C.border}} value={email} onChangeText={setEmail} placeholder="votre@email.com" placeholderTextColor={C.gray} keyboardType="email-address" />
            </View>
            <View>
              <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:6}}>Ville</Text>
              <TextInput style={{backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,fontSize:F.base,color:C.text,borderWidth:1,borderColor:C.border}} value={city} onChangeText={setCity} placeholder="Dakar" placeholderTextColor={C.gray} />
            </View>
          </View>

          <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.lg}}>
            <Text style={{fontSize:F.xs,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.md}}>Telephone</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:S.md,backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,borderWidth:1,borderColor:C.border}}>
              <Ionicons name="call" size={18} color={C.gray} />
              <Text style={{fontSize:F.base,color:C.gray}}>{user?user.phone:''}</Text>
              <Ionicons name="lock-closed" size={14} color={C.gray} style={{marginLeft:'auto'}} />
            </View>
            <Text style={{fontSize:F.xs,color:C.muted,marginTop:6}}>Le numero de telephone ne peut pas etre modifie</Text>
          </View>

          <TouchableOpacity onPress={handleSave} disabled={loading} activeOpacity={0.88} style={{borderRadius:R.xl,overflow:'hidden',opacity:loading?0.6:1,marginBottom:S.xl}}>
            <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:16,alignItems:'center'}}>
              <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>{loading?'Sauvegarde...':'Sauvegarder'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}