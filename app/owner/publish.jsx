import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
var hooks = require('../../src/store/hooks');
var listingsModule = require('../../src/store/listings');
var apiModule = require('../../src/api/client');
var getToken = hooks.getToken;
var BASE_URL = apiModule.BASE_URL;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var TYPES = ['STUDIO','APARTMENT','ROOM','COLOCATION'];
var TYPE_LABELS = {STUDIO:'Studio',APARTMENT:'Appartement',ROOM:'Chambre',COLOCATION:'Colocation'};
var EQUIP = [
  {key:'isFurnished',label:'Meuble'},
  {key:'hasWifi',label:'Wifi'},
  {key:'hasElectricity',label:'Electricite'},
  {key:'hasWater',label:'Eau'},
  {key:'hasParking',label:'Parking'},
  {key:'hasAC',label:'Climatisation'},
];

export default function Publish() {
  var titleS = useState(''); var title = titleS[0]; var setTitle = titleS[1];
  var descS = useState(''); var desc = descS[0]; var setDesc = descS[1];
  var priceS = useState(''); var price = priceS[0]; var setPrice = priceS[1];
  var depositS = useState(''); var deposit = depositS[0]; var setDeposit = depositS[1];
  var surfaceS = useState(''); var surface = surfaceS[0]; var setSurface = surfaceS[1];
  var cityS = useState('Dakar'); var city = cityS[0]; var setCity = cityS[1];
  var neighS = useState(''); var neigh = neighS[0]; var setNeigh = neighS[1];
  var addressS = useState(''); var address = addressS[0]; var setAddress = addressS[1];
  var typeS = useState('STUDIO'); var type = typeS[0]; var setType = typeS[1];
  var equipS = useState({}); var equip = equipS[0]; var setEquip = equipS[1];
  var photosS = useState([]); var photos = photosS[0]; var setPhotos = photosS[1];
  var photoFilesS = useState([]); var photoFiles = photoFilesS[0]; var setPhotoFiles = photoFilesS[1];
  var loadingS = useState(false); var loading = loadingS[0]; var setLoading = loadingS[1];
  var latS = useState(null); var lat = latS[0]; var setLat = latS[1];
  var lngS = useState(null); var lng = lngS[0]; var setLng = lngS[1];
  var gpsLoadingS = useState(false); var gpsLoading = gpsLoadingS[0]; var setGpsLoading = gpsLoadingS[1];

  function toggleEquip(key) {
    setEquip(function(prev) {
      var next = Object.assign({}, prev);
      next[key] = !prev[key];
      return next;
    });
  }

  function pickPhotos() {
    if (typeof document !== 'undefined') {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = function(e) {
        var files = Array.from(e.target.files);
        var urls = files.map(function(f) { return URL.createObjectURL(f); });
        setPhotos(function(prev) { return prev.concat(urls); });
        setPhotoFiles(function(prev) { return prev.concat(files); });
      };
      input.click();
    } else {
      ImagePicker.requestMediaLibraryPermissionsAsync().then(function(perm) {
        if (!perm.granted) { Alert.alert('Permission refusee'); return; }
        ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaType.images,
          allowsMultipleSelection: true,
          quality: 0.8,
        }).then(function(result) {
          if (!result.canceled) {
            var uris = result.assets.map(function(a) { return a.uri; });
            setPhotos(function(prev) { return prev.concat(uris); });
            setPhotoFiles(function(prev) { return prev.concat(result.assets); });
          }
        });
      });
    }
  }

  function removePhoto(idx) {
    setPhotos(function(prev) { return prev.filter(function(_,i){ return i!==idx; }); });
    setPhotoFiles(function(prev) { return prev.filter(function(_,i){ return i!==idx; }); });
  }

  function getGPS() {
    setGpsLoading(true);
    Location.requestForegroundPermissionsAsync().then(function(perm) {
      if (!perm.granted) {
        setGpsLoading(false);
        Alert.alert('Permission refusee','Autorisez la localisation');
        return;
      }
      return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }).then(function(loc) {
        setLat(loc.coords.latitude);
        setLng(loc.coords.longitude);
        setGpsLoading(false);
        Toast.show({ type:'success', text1:'Position obtenue', text2:'Coordonnees GPS enregistrees', visibilityTime:2000 });
        return Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }).then(function(geo) {
        if (geo && geo[0]) {
          var g = geo[0];
          if (!address) setAddress((g.street||'') + (g.district?' '+g.district:''));
          if (!neigh && g.district) setNeigh(g.district);
        }
      });
    }).catch(function() {
      setGpsLoading(false);
      Alert.alert('Erreur','Impossible d obtenir la position');
    });
  }

  function handleSubmit() {
    if (!title) { Toast.show({type:'error',text1:'Requis',text2:'Le titre est obligatoire',visibilityTime:2000}); return; }
    if (!price) { Toast.show({type:'error',text1:'Requis',text2:'Le prix est obligatoire',visibilityTime:2000}); return; }
    if (!neigh) { Toast.show({type:'error',text1:'Requis',text2:'Le quartier est obligatoire',visibilityTime:2000}); return; }

    setLoading(true);

    var data = Object.assign({
      title: title,
      description: desc,
      type: type,
      price: parseInt(price),
      surface: surface ? parseInt(surface) : null,
      city: city,
      neighborhood: neigh,
      address: address,
      latitude: lat,
      longitude: lng,
      deposit: deposit ? parseInt(deposit) : null,
    }, equip);

    var token = getToken();

    listingsModule.listingsStore.create(data, token).then(function(listing) {
      if (photos.length > 0) {
        var formData = new FormData();
        photoFiles.forEach(function(f, i) {
          if (f.uri) {
            formData.append('files', { uri: f.uri, type: 'image/jpeg', name: 'photo'+i+'.jpg' });
          } else {
            formData.append('files', f);
          }
        });
        return fetch(BASE_URL + '/media/listings/' + listing.id, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token, 'ngrok-skip-browser-warning': 'true' },
          body: formData,
        }).then(function() {
          return listing;
        });
      }
      return listing;
    }).then(function() {
      setLoading(false);
      Toast.show({ type:'success', text1:'Annonce publiee !', text2:'Votre annonce est en ligne', visibilityTime:2000 });
      setTimeout(function() { router.push('/owner/listings'); }, 2000);
    }).catch(function(err) {
      setLoading(false);
      Toast.show({ type:'error', text1:'Erreur', text2:'Impossible de publier', visibilityTime:2000 });
    });
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

          <Text style={st.section}>Photos du bien</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:S.xl}}>
            <View style={{flexDirection:'row',gap:S.sm}}>
              {photos.map(function(uri,i){
                return (
                  <View key={i} style={{position:'relative'}}>
                    <Image source={{uri:uri}} style={{width:100,height:100,borderRadius:R.lg}} resizeMode="cover" />
                    {i===0&&<View style={{position:'absolute',top:4,left:4,backgroundColor:C.primary,borderRadius:R.sm,paddingHorizontal:6,paddingVertical:2}}><Text style={{fontSize:9,fontWeight:'800',color:'#fff'}}>PRINCIPALE</Text></View>}
                    <TouchableOpacity onPress={function(){removePhoto(i);}} style={{position:'absolute',top:4,right:4,width:22,height:22,borderRadius:11,backgroundColor:'rgba(0,0,0,0.6)',alignItems:'center',justifyContent:'center'}}>
                      <Ionicons name="close" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                );
              })}
              <TouchableOpacity onPress={pickPhotos} style={{width:100,height:100,borderRadius:R.lg,backgroundColor:C.bg,borderWidth:2,borderColor:C.border,borderStyle:'dashed',alignItems:'center',justifyContent:'center',gap:4}}>
                <Ionicons name="camera" size={28} color={C.gray} />
                <Text style={{fontSize:F.xs,color:C.gray}}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

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

          <Text style={st.section}>Informations generales</Text>
          <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.xl,gap:S.md}}>
            <View>
              <Text style={st.label}>Titre *</Text>
              <TextInput style={st.input} placeholder="Ex: Studio meuble - Plateau" placeholderTextColor={C.gray} value={title} onChangeText={setTitle} />
            </View>
            <View>
              <Text style={st.label}>Description</Text>
              <TextInput style={[st.input,{height:100,textAlignVertical:'top'}]} placeholder="Decrivez votre bien..." placeholderTextColor={C.gray} value={desc} onChangeText={setDesc} multiline />
            </View>
            <View style={{flexDirection:'row',gap:S.sm}}>
              <View style={{flex:1}}>
                <Text style={st.label}>Prix (F/mois) *</Text>
                <TextInput style={st.input} placeholder="120000" placeholderTextColor={C.gray} value={price} onChangeText={setPrice} keyboardType="numeric" />
              </View>
              <View style={{flex:1}}>
                <Text style={st.label}>Caution (F)</Text>
                <TextInput style={st.input} placeholder="240000" placeholderTextColor={C.gray} value={deposit} onChangeText={setDeposit} keyboardType="numeric" />
              </View>
            </View>
            <View>
              <Text style={st.label}>Surface (m2)</Text>
              <TextInput style={st.input} placeholder="32" placeholderTextColor={C.gray} value={surface} onChangeText={setSurface} keyboardType="numeric" />
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
            <View>
              <Text style={st.label}>Adresse</Text>
              <TextInput style={st.input} placeholder="Rue, numero..." placeholderTextColor={C.gray} value={address} onChangeText={setAddress} />
            </View>
            <TouchableOpacity onPress={getGPS} style={{flexDirection:'row',alignItems:'center',gap:S.md,backgroundColor:lat?C.ownerLt:C.bg,borderRadius:R.lg,padding:S.md,borderWidth:1,borderColor:lat?C.owner:C.border}} activeOpacity={0.85}>
              <Ionicons name={lat?'checkmark-circle':'location'} size={22} color={lat?C.owner:C.primary} />
              <View style={{flex:1}}>
                <Text style={{fontSize:F.sm,fontWeight:'700',color:lat?C.owner:C.text}}>{gpsLoading?'Localisation en cours...':(lat?'Position GPS obtenue':'Obtenir ma position GPS')}</Text>
                {lat&&<Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>{lat.toFixed(4)}, {lng.toFixed(4)}</Text>}
              </View>
              {!lat&&<Ionicons name="navigate" size={18} color={C.primary} />}
            </TouchableOpacity>
          </View>

          <Text style={st.section}>Equipements</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:S.sm,marginBottom:S.xl}}>
            {EQUIP.map(function(e){
              var active = !!equip[e.key];
              return (
                <TouchableOpacity key={e.key} onPress={function(){toggleEquip(e.key);}} style={{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:S.md,paddingVertical:9,borderRadius:R.full,borderWidth:1.5,borderColor:active?C.owner:C.border,backgroundColor:active?C.ownerLt:'#fff'}}>
                  <Ionicons name={active?'checkmark-circle':'ellipse-outline'} size={16} color={active?C.owner:C.gray} />
                  <Text style={{fontSize:F.sm,fontWeight:'600',color:active?C.owner:C.textMd}}>{e.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.88} style={{borderRadius:R.xl,overflow:'hidden',marginBottom:S.xl,opacity:loading?0.6:1}}>
            <LinearGradient colors={['#2D7A5F','#1B4F3A','#0F2E22']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:17,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:S.md}}>
              <Ionicons name="cloud-upload" size={20} color="#fff" />
              <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>{loading?'Publication...':'Publier l annonce'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

var st = StyleSheet.create({
  section: {fontSize:10,fontWeight:'800',color:'#888888',letterSpacing:1.2,textTransform:'uppercase',marginBottom:12},
  label: {fontSize:12,fontWeight:'700',color:'#333333',marginBottom:6},
  input: {backgroundColor:'#F5F5F5',borderRadius:14,paddingVertical:14,paddingHorizontal:16,fontSize:14,color:'#111111',borderWidth:1,borderColor:'#EBEBEB'},
});