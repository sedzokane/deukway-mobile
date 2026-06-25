import { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
var hooks = require('../../src/store/hooks');
var listingsModule = require('../../src/store/listings');
var useListings = hooks.useListings;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;
var W = Dimensions.get('window').width;

var EXTRA = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
];

function fmt(p) { return new Intl.NumberFormat('fr-SN').format(p); }

export default function ListingDetail() {
  var params = useLocalSearchParams(); var id = params.id;
  var store = useListings();
  var imgS = useState(0); var imgIdx = imgS[0]; var setImgIdx = imgS[1];

  useEffect(function() { if(id) listingsModule.listingsStore.fetchOne(id); }, [id]);

  var l = store.current;
  if(!l || l.id !== id) {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#fff'}}>
        <Text style={{fontSize:36,marginBottom:12}}>⏳</Text>
        <Text style={{color:C.muted}}>Chargement...</Text>
      </View>
    );
  }

  var allPhotos = l.media && l.media.length>=4 ? l.media : (l.media||[]).concat(EXTRA.map(function(url,i){return {id:'e'+i,url:url,order:(l.media||[]).length+i};})).slice(0,5);

  return (
    <View style={{flex:1,backgroundColor:'#fff'}}>
      <SafeAreaView style={{position:'absolute',top:0,left:0,right:0,zIndex:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:S.lg,paddingVertical:S.sm}} edges={['top']}>
        <TouchableOpacity style={{width:38,height:38,borderRadius:19,backgroundColor:'rgba(255,255,255,0.92)',alignItems:'center',justifyContent:'center',elevation:2}} onPress={function(){router.back();}}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <View style={{flexDirection:'row',gap:8}}>
          <TouchableOpacity style={{width:38,height:38,borderRadius:19,backgroundColor:'rgba(255,255,255,0.92)',alignItems:'center',justifyContent:'center',elevation:2}}>
            <Ionicons name="share-social" size={18} color={C.text} />
          </TouchableOpacity>
          <TouchableOpacity style={{width:38,height:38,borderRadius:19,backgroundColor:'rgba(255,255,255,0.92)',alignItems:'center',justifyContent:'center',elevation:2}} onPress={function(){listingsModule.listingsStore.toggleFav(l.id);}}>
            <Ionicons name={l.isFavorite?'heart':'heart-outline'} size={20} color={l.isFavorite?C.danger:C.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{height:280,position:'relative'}}>
          <Image source={{uri:allPhotos[imgIdx]?allPhotos[imgIdx].url:''}} style={{width:W,height:280}} resizeMode="cover" />
          <LinearGradient colors={['transparent','rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFillObject} />
          {l.isVerified&&(
            <View style={{position:'absolute',bottom:S.md,left:S.lg,flexDirection:'row',alignItems:'center',backgroundColor:'rgba(201,150,58,0.92)',borderRadius:R.sm,paddingHorizontal:10,paddingVertical:4}}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" />
              <Text style={{fontSize:F.xs,fontWeight:'700',color:'#fff'}}> Vérifié</Text>
            </View>
          )}
          <View style={{position:'absolute',bottom:S.md,right:S.lg,flexDirection:'row',alignItems:'center',backgroundColor:'rgba(0,0,0,0.45)',borderRadius:R.md,paddingHorizontal:8,paddingVertical:3}}>
            <Ionicons name="camera" size={12} color="#fff" />
            <Text style={{fontSize:F.xs,color:'#fff'}}> {imgIdx+1}/{allPhotos.length}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{backgroundColor:'#fff'}} contentContainerStyle={{gap:4,padding:8,paddingHorizontal:S.lg}}>
          {allPhotos.map(function(p,i){
            return (
              <TouchableOpacity key={p.id} onPress={function(){setImgIdx(i);}} style={{width:64,height:46,borderRadius:8,overflow:'hidden',borderWidth:2,borderColor:imgIdx===i?C.primary:'transparent'}}>
                <Image source={{uri:p.url}} style={{width:'100%',height:'100%'}} resizeMode="cover" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={{padding:S.lg}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:S.md}}>
            <View style={{flex:1,marginRight:S.md}}>
              <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>{l.title}</Text>
              <View style={{flexDirection:'row',alignItems:'center',gap:4,marginTop:4}}>
                <Ionicons name="location" size={13} color={C.primary} />
                <Text style={{fontSize:F.sm,color:C.muted}}>{l.neighborhood}, {l.city}</Text>
              </View>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={{fontSize:F.xl,fontWeight:'900',color:C.primary}}>{fmt(l.price)}</Text>
              <Text style={{fontSize:F.xs,color:C.muted}}>F / mois</Text>
            </View>
          </View>

          <View style={{flexDirection:'row',gap:8,marginBottom:S.xl}}>
            {l.surface&&<View style={{flex:1,backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,alignItems:'center'}}><Text style={{fontSize:F.md,fontWeight:'800',color:C.text}}>{l.surface} m²</Text><Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>Surface</Text></View>}
            {l.rooms&&<View style={{flex:1,backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,alignItems:'center'}}><Text style={{fontSize:F.md,fontWeight:'800',color:C.text}}>{l.rooms}</Text><Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>Pièces</Text></View>}
            {l.deposit&&<View style={{flex:1,backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,alignItems:'center'}}><Text style={{fontSize:F.sm,fontWeight:'800',color:C.text,textAlign:'center'}}>{fmt(l.deposit)}F</Text><Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>Caution</Text></View>}
            <View style={{flex:1,backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,alignItems:'center'}}><Text style={{fontSize:F.md,fontWeight:'800',color:C.text}}>Dispo</Text><Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>Maintenant</Text></View>
          </View>

          <Text style={{fontSize:F.md,fontWeight:'800',color:C.text,marginBottom:S.md}}>Équipements</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:S.xl}}>
            {[
              [l.isFurnished,'bed','Meublé'],
              [l.hasElectricity,'flash','Électricité'],
              [l.hasWater,'water','Eau'],
              [l.hasWifi,'wifi','Wifi'],
              [l.hasParking,'car','Parking'],
              [l.hasAC,'snow','Climatisation'],
            ].filter(function(x){return x[0];}).map(function(x){
              return (
                <View key={x[2]} style={{flexDirection:'row',alignItems:'center',backgroundColor:C.primaryLt,borderRadius:R.full,paddingHorizontal:10,paddingVertical:5}}>
                  <Ionicons name={x[1]} size={12} color={C.primary} />
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary,marginLeft:4}}>{x[2]}</Text>
                </View>
              );
            })}
          </View>

          <Text style={{fontSize:F.md,fontWeight:'800',color:C.text,marginBottom:S.md}}>Description</Text>
          <Text style={{fontSize:F.base,color:C.muted,lineHeight:22,marginBottom:S.xl}}>{l.description}</Text>

          <Text style={{fontSize:F.md,fontWeight:'800',color:C.text,marginBottom:S.md}}>Propriétaire</Text>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md,backgroundColor:C.bg,borderRadius:R.xl,padding:S.md}}>
            <LinearGradient colors={['#F0A830','#D4821A']} style={{width:48,height:48,borderRadius:24,alignItems:'center',justifyContent:'center'}}>
              <Text style={{fontSize:16,fontWeight:'900',color:'#fff'}}>{l.owner.firstName[0]}{l.owner.lastName[0]}</Text>
            </LinearGradient>
            <View style={{flex:1}}>
              <Text style={{fontSize:F.base,fontWeight:'700',color:C.text}}>{l.owner.firstName} {l.owner.lastName}</Text>
              <Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>{l.viewCount} vues</Text>
            </View>
            <TouchableOpacity style={{width:40,height:40,borderRadius:20,backgroundColor:'#fff',borderWidth:0.5,borderColor:C.border,alignItems:'center',justifyContent:'center'}} onPress={function(){Linking.openURL('https://wa.me/'+l.owner.phone.replace(/[\s+]/g,''));}}>
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            </TouchableOpacity>
            <TouchableOpacity style={{width:40,height:40,borderRadius:20,backgroundColor:'#fff',borderWidth:0.5,borderColor:C.border,alignItems:'center',justifyContent:'center'}} onPress={function(){Linking.openURL('tel:'+l.owner.phone);}}>
              <Ionicons name="call" size={18} color={C.primary} />
            </TouchableOpacity>
          </View>
          <View style={{height:100}} />
        </View>
      </ScrollView>

      <SafeAreaView style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#fff',borderTopWidth:0.5,borderTopColor:C.border,paddingHorizontal:S.lg,paddingTop:S.md,flexDirection:'row',gap:10}} edges={['bottom']}>
        <TouchableOpacity style={{width:48,height:48,borderRadius:R.lg,borderWidth:1,borderColor:C.border,alignItems:'center',justifyContent:'center'}}>
          <Ionicons name="chatbubble-ellipses" size={20} color={C.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={{flex:1}} activeOpacity={0.88}>
          <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:14,alignItems:'center',borderRadius:R.xl}}>
            <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>Réserver une visite</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}