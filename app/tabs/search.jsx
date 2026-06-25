import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
var hooks = require('../../src/store/hooks');
var listingsModule = require('../../src/store/listings');
var useListings = hooks.useListings;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var TYPES = [
  {v:'all',l:'Tout',icon:'apps'},
  {v:'STUDIO',l:'Studio',icon:'business'},
  {v:'APARTMENT',l:'Appart.',icon:'home'},
  {v:'ROOM',l:'Chambre',icon:'bed'},
  {v:'COLOCATION',l:'Coloc',icon:'people'},
];

function fmt(p) { return new Intl.NumberFormat('fr-SN').format(p); }

export default function Search() {
  var store = useListings();
  var queryS = useState(''); var query = queryS[0]; var setQuery = queryS[1];
  var typeS = useState('all'); var type = typeS[0]; var setType = typeS[1];

  useEffect(function() { listingsModule.listingsStore.fetch(); }, []);

  var filtered = store.items.filter(function(l) {
    return (type==='all'||l.type===type) &&
      (query===''||l.title.toLowerCase().includes(query.toLowerCase())||l.neighborhood.toLowerCase().includes(query.toLowerCase()));
  });

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <SafeAreaView edges={['top']} style={{backgroundColor:'#fff',paddingHorizontal:S.lg,paddingBottom:S.sm,borderBottomWidth:0.5,borderBottomColor:C.border}}>
        <Text style={{fontSize:26,fontWeight:'900',color:C.text,marginBottom:S.md,letterSpacing:-0.5}}>Explorer</Text>
        <View style={{flexDirection:'row',alignItems:'center',backgroundColor:C.bg,borderRadius:R.xl,paddingHorizontal:S.md,paddingVertical:S.sm,gap:S.sm,marginBottom:S.sm,borderWidth:1,borderColor:C.border}}>
          <Ionicons name="search" size={18} color={C.muted} />
          <TextInput style={{flex:1,fontSize:F.base,color:C.text}} placeholder="Quartier, ville, type..." placeholderTextColor={C.gray} value={query} onChangeText={setQuery} />
          {query.length>0&&<TouchableOpacity onPress={function(){setQuery('');}}><Ionicons name="close-circle" size={18} color={C.muted} /></TouchableOpacity>}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingVertical:S.sm}}>
          {TYPES.map(function(tp){
            return (
              <TouchableOpacity key={tp.v} style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:S.md,paddingVertical:7,borderRadius:R.full,borderWidth:1,borderColor:type===tp.v?C.primary:C.border,backgroundColor:type===tp.v?C.primary:'#fff'}} onPress={function(){setType(tp.v);}} activeOpacity={0.8}>
                <Ionicons name={tp.icon} size={13} color={type===tp.v?'#fff':C.primary} />
                <Text style={{fontSize:F.sm,fontWeight:'600',color:type===tp.v?'#fff':C.textMd}}>{tp.l}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg,gap:S.md}}>
        <Text style={{fontSize:F.sm,color:C.muted,fontWeight:'600'}}>{filtered.length} annonce{filtered.length>1?'s':''}</Text>
        {filtered.map(function(l){
          return (
            <TouchableOpacity key={l.id} style={{backgroundColor:'#fff',borderRadius:R.xl,overflow:'hidden',flexDirection:'row',elevation:4}} onPress={function(){router.push('/listing/'+l.id);}} activeOpacity={0.9}>
              <View style={{width:110,height:110,position:'relative'}}>
                {l.media&&l.media[0]?<Image source={{uri:l.media[0].url}} style={{width:'100%',height:'100%'}} resizeMode="cover" />:<View style={{width:'100%',height:'100%',backgroundColor:C.border}} />}
                <TouchableOpacity style={{position:'absolute',top:6,right:6,width:28,height:28,borderRadius:14,backgroundColor:'rgba(0,0,0,0.3)',alignItems:'center',justifyContent:'center'}} onPress={function(){listingsModule.listingsStore.toggleFav(l.id);}}>
                  <Ionicons name={l.isFavorite?'heart':'heart-outline'} size={18} color={l.isFavorite?'#FF4040':'rgba(255,255,255,0.9)'} />
                </TouchableOpacity>
              </View>
              <View style={{flex:1,padding:S.md,justifyContent:'center'}}>
                <Text style={{fontSize:F.base,fontWeight:'800',color:C.text,marginBottom:4}} numberOfLines={1}>{l.title}</Text>
                <View style={{flexDirection:'row',alignItems:'center',gap:4,marginBottom:S.sm}}>
                  <Ionicons name="location" size={11} color={C.primary} />
                  <Text style={{fontSize:F.xs,color:C.muted,flex:1}}>{l.neighborhood}, {l.city}</Text>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                  <Text style={{fontSize:F.lg,fontWeight:'900',color:C.primary}}>{fmt(l.price)} <Text style={{fontSize:F.xs,fontWeight:'400',color:C.muted}}>F/mois</Text></Text>
                  {l.isVerified&&<View style={{flexDirection:'row',alignItems:'center',backgroundColor:C.goldLt,borderRadius:R.full,paddingHorizontal:7,paddingVertical:3}}><Ionicons name="shield-checkmark" size={10} color={C.gold} /><Text style={{fontSize:F.xs,fontWeight:'700',color:C.gold}}> Vérifié</Text></View>}
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