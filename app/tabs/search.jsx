import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
var hooks = require('../../src/store/hooks');
var listingsModule = require('../../src/store/listings');
var useListings = hooks.useListings;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var TYPES = [
  {v:'all',l:'Tout',icon:'apps'},
  {v:'STUDIO',l:'Studio',icon:'business'},
  {v:'APARTMENT',l:'Appart.',icon:'home'},
  {v:'ROOM',l:'Chambre',icon:'bed'},
  {v:'COLOCATION',l:'Coloc',icon:'people'},
];

var PRIX = [
  {l:'Tous les prix',min:0,max:999999},
  {l:'Moins de 50 000 F',min:0,max:50000},
  {l:'50 000 - 100 000 F',min:50000,max:100000},
  {l:'100 000 - 200 000 F',min:100000,max:200000},
  {l:'Plus de 200 000 F',min:200000,max:999999},
];

function fmt(p) { return new Intl.NumberFormat('fr-SN').format(p); }

export default function Search() {
  var store = useListings();
  var queryS = useState(''); var query = queryS[0]; var setQuery = queryS[1];
  var typeS = useState('all'); var type = typeS[0]; var setType = typeS[1];
  var prixS = useState(0); var prixIdx = prixS[0]; var setPrixIdx = prixS[1];
  var modalS = useState(false); var modal = modalS[0]; var setModal = modalS[1];
  var furnS = useState(false); var furn = furnS[0]; var setFurn = furnS[1];
  var wifiS = useState(false); var wifi = wifiS[0]; var setWifi = wifiS[1];
  var acS = useState(false); var ac = acS[0]; var setAc = acS[1];
  var refS = useState(false); var refreshing = refS[0]; var setRefreshing = refS[1];

  useEffect(function() { listingsModule.listingsStore.fetch(null, getToken()); }, []);

  function onRefresh() {
    setRefreshing(true);
    listingsModule.listingsStore.fetch(null, getToken()).then(function(){setRefreshing(false);});
  }

  var px = PRIX[prixIdx];
  var filtered = store.items.filter(function(l) {
    return (type==='all'||l.type===type) &&
      (query===''||l.title.toLowerCase().includes(query.toLowerCase())||l.neighborhood.toLowerCase().includes(query.toLowerCase())) &&
      l.price >= px.min && l.price <= px.max &&
      (!furn || l.isFurnished) &&
      (!wifi || l.hasWifi) &&
      (!ac || l.hasAC);
  });

  var hasFilter = prixIdx>0 || furn || wifi || ac;

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <SafeAreaView edges={['top']} style={{backgroundColor:'#fff',paddingHorizontal:S.lg,paddingBottom:S.sm,borderBottomWidth:0.5,borderBottomColor:C.border}}>
        <Text style={{fontSize:26,fontWeight:'900',color:C.text,marginBottom:S.md,letterSpacing:-0.5}}>Explorer</Text>
        <View style={{flexDirection:'row',alignItems:'center',gap:S.sm,marginBottom:S.sm}}>
          <View style={{flex:1,flexDirection:'row',alignItems:'center',backgroundColor:C.bg,borderRadius:R.xl,paddingHorizontal:S.md,paddingVertical:S.sm,gap:S.sm,borderWidth:1,borderColor:C.border}}>
            <Ionicons name="search" size={18} color={C.muted} />
            <TextInput style={{flex:1,fontSize:F.base,color:C.text}} placeholder="Quartier, ville, type..." placeholderTextColor={C.gray} value={query} onChangeText={setQuery} />
            {query.length>0&&<TouchableOpacity onPress={function(){setQuery('');}}><Ionicons name="close-circle" size={18} color={C.muted} /></TouchableOpacity>}
          </View>
          <TouchableOpacity onPress={function(){setModal(true);}} style={{width:42,height:42,borderRadius:R.lg,backgroundColor:hasFilter?C.primary:C.bg,borderWidth:1,borderColor:hasFilter?C.primary:C.border,alignItems:'center',justifyContent:'center'}}>
            <Ionicons name="options" size={20} color={hasFilter?'#fff':C.primary} />
          </TouchableOpacity>
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

      <Modal visible={modal} animationType="slide" transparent onRequestClose={function(){setModal(false);}}>
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'}}>
          <View style={{backgroundColor:'#fff',borderRadius:24,borderBottomLeftRadius:0,borderBottomRightRadius:0,padding:S.xl}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:S.xl}}>
              <Text style={{fontSize:F.lg,fontWeight:'900',color:C.text}}>Filtres</Text>
              <TouchableOpacity onPress={function(){setModal(false);}}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>
            <Text style={{fontSize:F.sm,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.md}}>Prix / mois</Text>
            {PRIX.map(function(p,i){
              return (
                <TouchableOpacity key={i} onPress={function(){setPrixIdx(i);}} style={{flexDirection:'row',alignItems:'center',gap:S.md,paddingVertical:S.md,borderBottomWidth:i<PRIX.length-1?0.5:0,borderBottomColor:C.border}}>
                  <View style={{width:22,height:22,borderRadius:11,borderWidth:2,borderColor:prixIdx===i?C.primary:C.border,backgroundColor:prixIdx===i?C.primary:'#fff',alignItems:'center',justifyContent:'center'}}>
                    {prixIdx===i&&<View style={{width:8,height:8,borderRadius:4,backgroundColor:'#fff'}} />}
                  </View>
                  <Text style={{fontSize:F.base,color:prixIdx===i?C.primary:C.text,fontWeight:prixIdx===i?'700':'400'}}>{p.l}</Text>
                </TouchableOpacity>
              );
            })}
            <Text style={{fontSize:F.sm,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.md,marginTop:S.xl}}>Equipements</Text>
            <View style={{flexDirection:'row',gap:S.sm,flexWrap:'wrap'}}>
              {[[furn,setFurn,'Meuble'],[wifi,setWifi,'Wifi'],[ac,setAc,'Climatise']].map(function(item){
                return (
                  <TouchableOpacity key={item[2]} onPress={function(){item[1](function(v){return !v;});}} style={{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:S.md,paddingVertical:9,borderRadius:R.full,borderWidth:1.5,borderColor:item[0]?C.primary:C.border,backgroundColor:item[0]?C.primaryLt:'#fff'}}>
                    <Ionicons name={item[0]?'checkmark-circle':'ellipse-outline'} size={16} color={item[0]?C.primary:C.gray} />
                    <Text style={{fontSize:F.sm,fontWeight:'600',color:item[0]?C.primary:C.textMd}}>{item[2]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{flexDirection:'row',gap:S.sm,marginTop:S.xl}}>
              <TouchableOpacity onPress={function(){setPrixIdx(0);setFurn(false);setWifi(false);setAc(false);}} style={{flex:1,paddingVertical:14,alignItems:'center',borderRadius:R.xl,borderWidth:1,borderColor:C.border}}>
                <Text style={{fontSize:F.base,fontWeight:'700',color:C.textMd}}>Reinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={function(){setModal(false);}} style={{flex:2,borderRadius:R.xl,overflow:'hidden'}}>
                <LinearGradient colors={['#F0A830','#D4821A']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:14,alignItems:'center'}}>
                  <Text style={{fontSize:F.base,fontWeight:'800',color:'#fff'}}>Voir {filtered.length} resultats</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg,gap:S.md}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}>
        <Text style={{fontSize:F.sm,color:C.muted,fontWeight:'600'}}>{filtered.length} annonce{filtered.length>1?'s':''}</Text>
        {filtered.map(function(l){
          return (
            <TouchableOpacity key={l.id} style={{backgroundColor:'#fff',borderRadius:R.xl,overflow:'hidden',flexDirection:'row',elevation:4}} onPress={function(){router.push('/listing/'+l.id);}} activeOpacity={0.9}>
              <View style={{width:110,height:110,position:'relative'}}>
                {l.media&&l.media[0]?<Image source={{uri:l.media[0].url}} style={{width:'100%',height:'100%'}} resizeMode="cover" />:<View style={{width:'100%',height:'100%',backgroundColor:C.border}} />}
                <TouchableOpacity style={{position:'absolute',top:6,right:6,width:28,height:28,borderRadius:14,backgroundColor:'rgba(0,0,0,0.3)',alignItems:'center',justifyContent:'center'}} onPress={function(){listingsModule.listingsStore.toggleFav(l.id, getToken());}}>
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
                  {l.isVerified&&<View style={{flexDirection:'row',alignItems:'center',backgroundColor:C.goldLt,borderRadius:R.full,paddingHorizontal:7,paddingVertical:3}}><Ionicons name="shield-checkmark" size={10} color={C.gold} /><Text style={{fontSize:F.xs,fontWeight:'700',color:C.gold}}> Verifie</Text></View>}
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