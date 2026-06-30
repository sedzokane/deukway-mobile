import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, StyleSheet, Animated, PanResponder, Alert } from 'react-native';
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

function FavoriteCard({ l, onRemove }) {
  var translateX = useRef(new Animated.Value(0)).current;
  var opacity = useRef(new Animated.Value(1)).current;

  var panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: function(evt, gs) {
      return Math.abs(gs.dx) > 10 && Math.abs(gs.dy) < 20;
    },
    onPanResponderMove: function(evt, gs) {
      if (gs.dx < 0) translateX.setValue(gs.dx);
    },
    onPanResponderRelease: function(evt, gs) {
      if (gs.dx < -100) {
        Animated.parallel([
          Animated.timing(translateX, { toValue: -400, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(function() { onRemove(l.id); });
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  });

  return (
    <Animated.View style={{transform:[{translateX:translateX}], opacity:opacity, marginBottom:S.md}} {...panResponder.panHandlers}>
      <TouchableOpacity style={{backgroundColor:'#fff',borderRadius:R.xl,overflow:'hidden',elevation:4}} onPress={function(){router.push('/listing/'+l.id);}} activeOpacity={0.9}>
        <View style={{height:160,position:'relative'}}>
          {l.media&&l.media[0]
            ?<Image source={{uri:l.media[0].url}} style={{width:'100%',height:'100%'}} resizeMode="cover" />
            :<LinearGradient colors={['#1A2E4A','#243D61']} style={{flex:1}} />
          }
          <LinearGradient colors={['transparent','rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFillObject} />
          <TouchableOpacity style={{position:'absolute',top:S.sm,right:S.md,width:36,height:36,borderRadius:18,backgroundColor:'rgba(0,0,0,0.3)',alignItems:'center',justifyContent:'center'}} onPress={function(){onRemove(l.id);}}>
            <Ionicons name="heart" size={20} color="#FF4040" />
          </TouchableOpacity>
          {l.isVerified&&(
            <View style={{position:'absolute',top:S.sm,left:S.md,flexDirection:'row',alignItems:'center',backgroundColor:'rgba(201,150,58,0.92)',borderRadius:R.sm,paddingHorizontal:8,paddingVertical:3}}>
              <Ionicons name="shield-checkmark" size={10} color="#fff" />
              <Text style={{fontSize:9,fontWeight:'700',color:'#fff'}}> Vérifié</Text>
            </View>
          )}
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
          <View style={{flexDirection:'row',gap:6,flexWrap:'wrap'}}>
            {l.isFurnished&&<View style={{backgroundColor:C.primaryLt,borderRadius:R.full,paddingHorizontal:8,paddingVertical:3}}><Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary}}>Meublé</Text></View>}
            {l.hasWifi&&<View style={{backgroundColor:C.primaryLt,borderRadius:R.full,paddingHorizontal:8,paddingVertical:3}}><Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary}}>Wifi</Text></View>}
            {l.hasAC&&<View style={{backgroundColor:C.primaryLt,borderRadius:R.full,paddingHorizontal:8,paddingVertical:3}}><Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary}}>Climatisé</Text></View>}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Favorites() {
  var favsS = useState([]); var favs = favsS[0]; var setFavs = favsS[1];
  var loadingS = useState(true); var loading = loadingS[0]; var setLoading = loadingS[1];
  var refS = useState(false); var refreshing = refS[0]; var setRefreshing = refS[1];
  var sortS = useState('recent'); var sort = sortS[0]; var setSort = sortS[1];

  function load() {
    api.get('/favorites', getToken()).then(function(data) {
      setFavs(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(function(){ setLoading(false); });
  }

  function onRefresh() {
    setRefreshing(true);
    api.get('/favorites', getToken()).then(function(data) {
      setFavs(Array.isArray(data) ? data : []);
      setRefreshing(false);
    }).catch(function(){ setRefreshing(false); });
  }

  function handleRemove(id) {
    listingsModule.listingsStore.toggleFav(id, getToken()).then(function() {
      setFavs(function(prev) { return prev.filter(function(f){ return f.id !== id; }); });
    });
  }

  function clearAll() {
    if (favs.length === 0) return;
    Alert.alert(
      'Vider les favoris',
      'Êtes-vous sûr de vouloir retirer toutes vos annonces favorites ?',
      [
        { text:'Annuler', style:'cancel' },
        { text:'Vider', style:'destructive', onPress: function() {
          Promise.all(favs.map(function(f) { return listingsModule.listingsStore.toggleFav(f.id, getToken()); })).then(function() {
            setFavs([]);
          });
        }},
      ]
    );
  }

  useEffect(function() { load(); }, []);

  var sortedFavs = favs.slice().sort(function(a, b) {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    return 0;
  });

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{flex:1}}>
              <Text style={{fontSize:22,fontWeight:'900',color:'#fff'}}>Mes favoris</Text>
              <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)'}}>{favs.length} annonce{favs.length!==1?'s':''}</Text>
            </View>
            {favs.length>0&&(
              <TouchableOpacity onPress={clearAll} style={{backgroundColor:'rgba(255,255,255,0.15)',borderRadius:R.full,paddingHorizontal:S.md,paddingVertical:6}}>
                <Text style={{fontSize:F.xs,fontWeight:'700',color:'#fff'}}>Tout vider</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {favs.length>1&&(
        <View style={{flexDirection:'row',gap:S.sm,padding:S.lg,paddingBottom:0}}>
          {[
            {v:'recent',l:'Récents'},
            {v:'price_asc',l:'Prix croissant'},
            {v:'price_desc',l:'Prix décroissant'},
          ].map(function(s) {
            return (
              <TouchableOpacity key={s.v} onPress={function(){setSort(s.v);}} style={{paddingHorizontal:S.md,paddingVertical:6,borderRadius:R.full,borderWidth:1,borderColor:sort===s.v?C.primary:C.border,backgroundColor:sort===s.v?C.primary:'#fff'}}>
                <Text style={{fontSize:F.xs,fontWeight:'700',color:sort===s.v?'#fff':C.muted}}>{s.l}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}>

        {!loading&&favs.length>0&&(
          <View style={{backgroundColor:'rgba(0,0,0,0.04)',borderRadius:R.lg,padding:S.md,marginBottom:S.lg,flexDirection:'row',alignItems:'center',gap:S.sm}}>
            <Ionicons name="information-circle-outline" size={16} color={C.muted} />
            <Text style={{fontSize:F.xs,color:C.muted}}>Glissez vers la gauche pour retirer un favori</Text>
          </View>
        )}

        {loading&&(
          <Text style={{textAlign:'center',color:C.muted,paddingVertical:40}}>Chargement...</Text>
        )}

        {!loading&&favs.length===0&&(
          <View style={{alignItems:'center',paddingVertical:60}}>
            <Text style={{fontSize:48,marginBottom:12}}>❤️</Text>
            <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Aucun favori</Text>
            <Text style={{fontSize:F.sm,color:C.muted,marginTop:8,textAlign:'center'}}>Ajoutez des annonces a vos favoris en cliquant sur le coeur</Text>
            <TouchableOpacity onPress={function(){router.push('/tabs/search');}} style={{marginTop:S.lg,backgroundColor:C.primary,borderRadius:R.xl,paddingHorizontal:S.xl,paddingVertical:10}}>
              <Text style={{fontSize:F.sm,fontWeight:'700',color:'#fff'}}>Explorer les annonces</Text>
            </TouchableOpacity>
          </View>
        )}

        {sortedFavs.map(function(l){
          return <FavoriteCard key={l.id} l={l} onRemove={handleRemove} />;
        })}

        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}