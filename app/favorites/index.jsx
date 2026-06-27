import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
var hooks = require('../../src/store/hooks');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var listingsModule = require('../../src/store/listings');
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

function fmt(p) { return new Intl.NumberFormat('fr-SN').format(p); }

export default function Favorites() {
  var favsS = useState([]); var favs = favsS[0]; var setFavs = favsS[1];
  var refS = useState(false); var refreshing = refS[0]; var setRefreshing = refS[1];

  function load() {
    api.get('/favorites', getToken()).then(function(data) {
      setFavs(Array.isArray(data) ? data : []);
    }).catch(function(){});
  }

  function onRefresh() {
    setRefreshing(true);
    api.get('/favorites', getToken()).then(function(data) {
      setFavs(Array.isArray(data) ? data : []);
      setRefreshing(false);
    }).catch(function(){ setRefreshing(false); });
  }

  function handleToggle(id) {
    listingsModule.listingsStore.toggleFav(id, getToken()).then(function() {
      setFavs(function(prev) { return prev.filter(function(f){ return f.id !== id; }); });
    });
  }

  useEffect(function() { load(); }, []);

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={{fontSize:22,fontWeight:'900',color:'#fff'}}>Mes favoris</Text>
              <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)'}}>{favs.length} annonce{favs.length>1?'s':''}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg,gap:S.md}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}>
        {favs.length===0&&(
          <View style={{alignItems:'center',paddingVertical:60}}>
            <Text style={{fontSize:48,marginBottom:12}}>❤️</Text>
            <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Aucun favori</Text>
            <Text style={{fontSize:F.sm,color:C.muted,marginTop:8,textAlign:'center'}}>Ajoutez des annonces a vos favoris en cliquant sur le coeur</Text>
            <TouchableOpacity onPress={function(){router.push('/tabs/search');}} style={{marginTop:S.lg,backgroundColor:C.primary,borderRadius:R.xl,paddingHorizontal:S.xl,paddingVertical:10}}>
              <Text style={{fontSize:F.sm,fontWeight:'700',color:'#fff'}}>Explorer les annonces</Text>
            </TouchableOpacity>
          </View>
        )}
        {favs.map(function(l){
          return (
            <TouchableOpacity key={l.id} style={{backgroundColor:'#fff',borderRadius:R.xl,overflow:'hidden',elevation:4}} onPress={function(){router.push('/listing/'+l.id);}} activeOpacity={0.9}>
              <View style={{height:160,position:'relative'}}>
                {l.media&&l.media[0]
                  ?<Image source={{uri:l.media[0].url}} style={{width:'100%',height:'100%'}} resizeMode="cover" />
                  :<LinearGradient colors={['#1A2E4A','#243D61']} style={{flex:1}} />
                }
                <LinearGradient colors={['transparent','rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFillObject} />
                <TouchableOpacity style={{position:'absolute',top:S.sm,right:S.md,width:36,height:36,borderRadius:18,backgroundColor:'rgba(0,0,0,0.3)',alignItems:'center',justifyContent:'center'}} onPress={function(){handleToggle(l.id);}}>
                  <Ionicons name="heart" size={20} color="#FF4040" />
                </TouchableOpacity>
                <View style={{position:'absolute',bottom:S.md,left:S.md}}>
                  <Text style={{fontSize:F.xl,fontWeight:'900',color:'#fff'}}>{fmt(l.price)}<Text style={{fontSize:F.xs,fontWeight:'400'}}> F/mois</Text></Text>
                </View>
              </View>
              <View style={{padding:S.md}}>
                <Text style={{fontSize:F.base,fontWeight:'800',color:C.text,marginBottom:4}} numberOfLines={1}>{l.title}</Text>
                <View style={{flexDirection:'row',alignItems:'center',gap:4,marginBottom:S.sm}}>
                  <Ionicons name="location" size={12} color={C.primary} />
                  <Text style={{fontSize:F.xs,color:C.muted}}>{l.neighborhood}, {l.city}</Text>
                </View>
                <View style={{flexDirection:'row',gap:6}}>
                  {l.isFurnished&&<View style={{backgroundColor:C.primaryLt,borderRadius:R.full,paddingHorizontal:8,paddingVertical:3}}><Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary}}>Meuble</Text></View>}
                  {l.hasWifi&&<View style={{backgroundColor:C.primaryLt,borderRadius:R.full,paddingHorizontal:8,paddingVertical:3}}><Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary}}>Wifi</Text></View>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}