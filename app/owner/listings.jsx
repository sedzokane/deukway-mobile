import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
var hooks = require('../../src/store/hooks');
var listingsModule = require('../../src/store/listings');
var useListings = hooks.useListings;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

function fmt(p) { return new Intl.NumberFormat('fr-SN').format(p); }

export default function Listings() {
  var store = useListings();
  var myListings = store.myListings || [];

  useEffect(function(){ listingsModule.listingsStore.fetchMyListings(getToken()); }, []);

  function onRefresh() {
    listingsModule.listingsStore.fetchMyListings(getToken());
  }

  function handleDelete(id) {
    Toast.show({ type:'error', text1:'Suppression', text2:'Bientot disponible', visibilityTime:2000 });
  }

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#0F2E22','#1B4F3A','#2D7A5F']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.xl,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <View>
              <Text style={{fontSize:22,fontWeight:'900',color:'#fff'}}>Mes biens</Text>
              <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)',marginTop:2}}>{myListings.length} annonce{myListings.length>1?'s':''}</Text>
            </View>
            <TouchableOpacity style={{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'rgba(255,255,255,0.15)',borderRadius:R.xl,paddingHorizontal:S.md,paddingVertical:8,borderWidth:0.5,borderColor:'rgba(255,255,255,0.2)'}} onPress={function(){router.push('/owner/publish');}}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={{fontSize:F.sm,fontWeight:'700',color:'#fff'}}>Publier</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg,gap:S.md}}>
        {myListings.length===0&&(
          <View style={{alignItems:'center',paddingVertical:60}}>
            <Text style={{fontSize:48,marginBottom:12}}>🏠</Text>
            <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Aucune annonce</Text>
            <TouchableOpacity onPress={function(){router.push('/owner/publish');}} style={{marginTop:S.md,backgroundColor:C.owner,borderRadius:R.xl,paddingHorizontal:S.xl,paddingVertical:10}}>
              <Text style={{fontSize:F.sm,fontWeight:'700',color:'#fff'}}>Publier une annonce</Text>
            </TouchableOpacity>
          </View>
        )}
        {myListings.map(function(l){
          return (
            <View key={l.id} style={{backgroundColor:'#fff',borderRadius:R.xl,overflow:'hidden',elevation:4}}>
              <View style={{height:140,position:'relative'}}>
                {l.media&&l.media[0]
                  ?<Image source={{uri:l.media[0].url}} style={{width:'100%',height:'100%'}} resizeMode="cover" />
                  :<LinearGradient colors={['#1B4F3A','#2D7A5F']} style={{flex:1}} />}
                <LinearGradient colors={['transparent','rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFillObject} />
                <View style={{position:'absolute',bottom:S.md,left:S.md,right:S.md,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end'}}>
                  <Text style={{fontSize:F.lg,fontWeight:'900',color:'#fff'}}>{fmt(l.price)} F<Text style={{fontSize:F.xs,fontWeight:'400'}}>/mois</Text></Text>
                  <View style={{borderRadius:R.full,paddingHorizontal:10,paddingVertical:4,backgroundColor:'#05996922',borderWidth:0.5,borderColor:'#059669'}}>
                    <Text style={{fontSize:F.xs,fontWeight:'700',color:'#059669'}}>Active</Text>
                  </View>
                </View>
              </View>
              <View style={{padding:S.md}}>
                <Text style={{fontSize:F.base,fontWeight:'800',color:C.text,marginBottom:4}} numberOfLines={1}>{l.title}</Text>
                <View style={{flexDirection:'row',alignItems:'center',gap:4,marginBottom:S.md}}>
                  <Ionicons name="location" size={12} color={C.muted} />
                  <Text style={{fontSize:F.xs,color:C.muted}}>{l.neighborhood}, {l.city}</Text>
                  <View style={{flex:1}} />
                  <Ionicons name="eye" size={12} color={C.gray} />
                  <Text style={{fontSize:F.xs,color:C.gray}}>{l.viewCount} vues</Text>
                </View>
                <View style={{flexDirection:'row',gap:S.sm}}>
                  <TouchableOpacity onPress={function(){router.push('/listing/'+l.id);}} style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:9,borderRadius:R.lg,backgroundColor:C.ownerLt}}>
                    <Ionicons name="eye" size={14} color={C.owner} />
                    <Text style={{fontSize:F.xs,fontWeight:'700',color:C.owner}}>Voir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:9,borderRadius:R.lg,backgroundColor:C.primaryLt}}>
                    <Ionicons name="create" size={14} color={C.primary} />
                    <Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary}}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={function(){handleDelete(l.id);}} style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:9,borderRadius:R.lg,backgroundColor:'#FFF0F0'}}>
                    <Ionicons name="trash" size={14} color="#DC2626" />
                    <Text style={{fontSize:F.xs,fontWeight:'700',color:'#DC2626'}}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}