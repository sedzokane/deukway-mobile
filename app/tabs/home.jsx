import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Animated, RefreshControl, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
var hooks = require('../../src/store/hooks');
var listingsModule = require('../../src/store/listings');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var useAuth = hooks.useAuth;
var useListings = hooks.useListings;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var HERO_PHOTOS = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900',
];
var HERO_TAGS = ['Coup de coeur','Nouveau','Exclusif'];
var CATS = [
  {v:'all',l:'Tout',icon:'apps'},
  {v:'STUDIO',l:'Studios',icon:'business'},
  {v:'APARTMENT',l:'Appartements',icon:'home'},
  {v:'ROOM',l:'Chambres',icon:'bed'},
  {v:'COLOCATION',l:'Colocs',icon:'people'},
];
var MINI = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400',
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400',
];
var TYPE_LABEL = {STUDIO:'Studio',APARTMENT:'Appartement',ROOM:'Chambre',COLOCATION:'Colocation'};
var TYPE_GRAD = {STUDIO:['#1B4F3A','#2D7A5F'],APARTMENT:['#1A2E4A','#243D61'],ROOM:['#4B0082','#7B2FBE'],COLOCATION:['#7A1B1B','#DC2626']};

function fmt(p) { return new Intl.NumberFormat('fr-SN').format(p); }
function isValidUrl(url) { return url && (url.startsWith('http://') || url.startsWith('https://')); }

function StarRating({ rating }) {
  if (!rating || rating === 0) return null;
  return (
    <View style={{flexDirection:'row',alignItems:'center',gap:2}}>
      <Ionicons name="star" size={11} color="#F59E0B" />
      <Text style={{fontSize:F.xs,fontWeight:'700',color:'#F59E0B'}}>{rating.toFixed(1)}</Text>
    </View>
  );
}

export default function Home() {
  var auth = useAuth(); var user = auth.user;
  var store = useListings(); var items = store.items;
  var heroS = useState(0); var heroIdx = heroS[0]; var setHeroIdx = heroS[1];
  var catS = useState('all'); var cat = catS[0]; var setCat = catS[1];
  var refS = useState(false); var refreshing = refS[0]; var setRefreshing = refS[1];
  var ratingsS = useState({}); var ratings = ratingsS[0]; var setRatings = ratingsS[1];
  var fade = useRef(new Animated.Value(1)).current;

  useEffect(function() { listingsModule.listingsStore.fetch(null, getToken()); }, []);

  useEffect(function() {
    if (items.length > 0) {
      var ownerIds = [...new Set(items.map(function(l){ return l.ownerId; }))];
      ownerIds.forEach(function(ownerId) {
        api.get('/reviews/user/'+ownerId, getToken()).then(function(data) {
          if (data && data.average) {
            setRatings(function(prev) {
              var next = Object.assign({}, prev);
              next[ownerId] = data.average;
              return next;
            });
          }
        }).catch(function(){});
      });
    }
  }, [items.length]);

  useEffect(function() {
    var timer = setInterval(function() {
      Animated.timing(fade,{toValue:0,duration:300,useNativeDriver:true}).start(function() {
        setHeroIdx(function(i){return (i+1)%3;});
        Animated.timing(fade,{toValue:1,duration:400,useNativeDriver:true}).start();
      });
    },4500);
    return function(){clearInterval(timer);};
  },[]);

  var h = new Date().getHours();
  var greet = h<12?'Bonjour':h<18?'Bon apres-midi':'Bonsoir';

  var heroItems = items.slice(0,3);
  var heroPhoto = heroItems[heroIdx]&&heroItems[heroIdx].media&&heroItems[heroIdx].media[0]
    ? heroItems[heroIdx].media[0].url : HERO_PHOTOS[heroIdx];
  var heroLabel = heroItems[heroIdx] ? heroItems[heroIdx].title : '';
  var heroPrice = heroItems[heroIdx] ? fmt(heroItems[heroIdx].price)+' F/mois' : '';
  var heroId = heroItems[heroIdx] ? heroItems[heroIdx].id : null;
  var heroTag = HERO_TAGS[heroIdx];

  var popular = items.filter(function(l){ return l.viewCount > 0; }).sort(function(a,b){ return b.viewCount - a.viewCount; }).slice(0,5);
  var recent = items.slice(0,10);

  function onRefresh() {
    setRefreshing(true);
    listingsModule.listingsStore.fetch(null, getToken()).then(function(){setRefreshing(false);});
  }

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingHorizontal:S.xl,paddingBottom:S.xl2}}>
        <SafeAreaView edges={['top']}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:S.lg}}>
            <View>
              <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)',marginBottom:3}}>{greet}, {user?user.firstName:''} 👋</Text>
              <Text style={{fontSize:22,fontWeight:'900',color:'#fff',lineHeight:30,letterSpacing:-0.5}}>Trouvez votre{'\n'}logement ideal</Text>
            </View>
            <TouchableOpacity style={{width:42,height:42,borderRadius:21,backgroundColor:'rgba(255,255,255,0.12)',alignItems:'center',justifyContent:'center'}} onPress={function(){router.push('/notifications');}}>
              <Ionicons name="notifications" size={22} color="#fff" />
              <View style={{position:'absolute',top:8,right:8,width:9,height:9,borderRadius:5,backgroundColor:C.danger,borderWidth:1.5,borderColor:'rgba(255,255,255,0.8)'}} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{flexDirection:'row',alignItems:'center',backgroundColor:'#fff',borderRadius:R.xl,paddingVertical:S.sm,paddingLeft:S.md,paddingRight:S.sm,gap:S.sm,elevation:6}} onPress={function(){router.push('/tabs/search');}} activeOpacity={0.9}>
            <Ionicons name="search" size={18} color={C.muted} />
            <Text style={{flex:1,fontSize:F.sm,color:C.gray}}>Quartier, ville, type...</Text>
            <View style={{width:36,height:36,backgroundColor:C.primaryLt,borderRadius:18,alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="options" size={15} color={C.primary} />
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}>

        {/* Hero */}
        <View style={{height:220,position:'relative',marginHorizontal:S.lg,marginTop:S.lg,borderRadius:R.xl2,overflow:'hidden',elevation:14}}>
          <Animated.Image source={{uri:heroPhoto}} style={{width:'100%',height:'100%',opacity:fade}} resizeMode="cover" />
          <LinearGradient colors={['transparent','rgba(0,0,0,0.75)']} style={StyleSheet.absoluteFillObject} />
          <View style={{position:'absolute',bottom:S.lg,left:S.lg,right:90}}>
            <View style={{alignSelf:'flex-start',borderRadius:R.sm,paddingHorizontal:10,paddingVertical:4,marginBottom:S.sm,backgroundColor:C.primary}}>
              <Text style={{fontSize:F.xs,fontWeight:'800',color:'#fff',letterSpacing:1}}>{heroTag}</Text>
            </View>
            <Text style={{fontSize:F.md,fontWeight:'700',color:'#fff',marginBottom:3}} numberOfLines={1}>{heroLabel}</Text>
            <Text style={{fontSize:F.xl,fontWeight:'900',color:C.primary}}>{heroPrice}</Text>
          </View>
          {heroId&&(
            <TouchableOpacity style={{position:'absolute',bottom:S.lg,right:S.md,backgroundColor:'rgba(255,255,255,0.15)',borderRadius:R.lg,paddingHorizontal:S.md,paddingVertical:8,borderWidth:1,borderColor:'rgba(255,255,255,0.25)'}} onPress={function(){router.push('/listing/'+heroId);}}>
              <Text style={{fontSize:F.sm,fontWeight:'700',color:'#fff'}}>Voir →</Text>
            </TouchableOpacity>
          )}
          <View style={{position:'absolute',top:S.md,right:S.md,flexDirection:'row',gap:5}}>
            {[0,1,2].map(function(_,i){return <View key={i} style={{width:i===heroIdx?18:6,height:6,borderRadius:3,backgroundColor:i===heroIdx?C.primary:'rgba(255,255,255,0.3)'}} />;} )}
          </View>
        </View>

        {/* Mini photos */}
        <View style={{flexDirection:'row',gap:5,paddingHorizontal:S.lg,marginTop:S.md,height:80}}>
          {MINI.map(function(uri,i){
            return (
              <View key={i} style={{flex:1,borderRadius:R.lg,overflow:'hidden',backgroundColor:C.border}}>
                <Image source={{uri:uri}} style={{width:'100%',height:'100%'}} resizeMode="cover" />
                <LinearGradient colors={['transparent','rgba(0,0,0,0.4)']} style={StyleSheet.absoluteFillObject} />
              </View>
            );
          })}
        </View>

        {/* Catégories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{backgroundColor:'#fff',borderBottomWidth:0.5,borderBottomColor:C.border,marginTop:S.sm}} contentContainerStyle={{gap:8,paddingHorizontal:S.lg,paddingVertical:S.md}}>
          {CATS.map(function(c){
            return (
              <TouchableOpacity key={c.v} style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:S.md,paddingVertical:8,borderRadius:R.full,borderWidth:1,borderColor:cat===c.v?C.primary:C.border,backgroundColor:cat===c.v?C.primary:'#fff'}}
                onPress={function(){setCat(c.v);listingsModule.listingsStore.fetch(c.v==='all'?null:{type:c.v}, getToken());}} activeOpacity={0.8}>
                <Ionicons name={c.icon} size={13} color={cat===c.v?'#fff':C.primary} />
                <Text style={{fontSize:F.sm,fontWeight:'600',color:cat===c.v?'#fff':C.textMd}}>{c.l}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={{paddingHorizontal:S.lg}}>

          {/* Annonces populaires */}
          {popular.length>0&&(
            <View style={{marginTop:S.lg,marginBottom:S.md}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:S.md}}>
                <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text,letterSpacing:-0.2}}>🔥 Populaires</Text>
                <TouchableOpacity onPress={function(){router.push('/tabs/search');}}>
                  <Text style={{fontSize:F.sm,color:C.primary,fontWeight:'700'}}>Voir tout →</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:S.md}}>
                {popular.map(function(l){
                  return (
                    <TouchableOpacity key={l.id} onPress={function(){router.push('/listing/'+l.id);}} style={{width:180,backgroundColor:'#fff',borderRadius:R.xl,overflow:'hidden',elevation:4}} activeOpacity={0.9}>
                      <View style={{height:120,position:'relative'}}>
                        {l.media&&l.media[0]
                          ? <Image source={{uri:l.media[0].url}} style={{width:'100%',height:'100%'}} resizeMode="cover" />
                          : <LinearGradient colors={TYPE_GRAD[l.type]||['#333','#555']} style={{flex:1}} />
                        }
                        <LinearGradient colors={['transparent','rgba(0,0,0,0.5)']} style={StyleSheet.absoluteFillObject} />
                        <View style={{position:'absolute',bottom:S.sm,left:S.sm}}>
                          <Text style={{fontSize:F.sm,fontWeight:'900',color:'#fff'}}>{fmt(l.price)} F</Text>
                        </View>
                        <View style={{position:'absolute',top:S.sm,right:S.sm,flexDirection:'row',alignItems:'center',gap:3,backgroundColor:'rgba(0,0,0,0.4)',borderRadius:R.full,paddingHorizontal:6,paddingVertical:3}}>
                          <Ionicons name="eye" size={10} color="#fff" />
                          <Text style={{fontSize:9,color:'#fff',fontWeight:'700'}}>{l.viewCount}</Text>
                        </View>
                      </View>
                      <View style={{padding:S.sm}}>
                        <Text style={{fontSize:F.sm,fontWeight:'800',color:C.text,marginBottom:2}} numberOfLines={1}>{l.title}</Text>
                        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                          <Text style={{fontSize:F.xs,color:C.muted}} numberOfLines={1}>{l.neighborhood}</Text>
                          <StarRating rating={ratings[l.ownerId]} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Badge vérifié */}
          <TouchableOpacity style={{flexDirection:'row',alignItems:'center',gap:S.md,backgroundColor:C.primaryLt,borderRadius:R.lg,padding:S.md,marginBottom:S.lg,borderWidth:0.5,borderColor:'rgba(212,130,26,0.2)'}} activeOpacity={0.88}>
            <Ionicons name="shield-checkmark" size={20} color={C.primary} />
            <View style={{flex:1}}>
              <Text style={{fontSize:F.sm,fontWeight:'700',color:C.primary}}>Annonces verifiees Deukway</Text>
              <Text style={{fontSize:F.xs,color:C.gold}}>Proprietaires et biens controles</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.primary} />
          </TouchableOpacity>

          {/* Section titre */}
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:S.md}}>
            <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text,letterSpacing:-0.2}}>Annonces recentes</Text>
            <TouchableOpacity onPress={function(){router.push('/tabs/search');}}>
              <Text style={{fontSize:F.sm,color:C.primary,fontWeight:'700'}}>Voir tout →</Text>
            </TouchableOpacity>
          </View>

          {/* Liste annonces */}
          {items.map(function(l){
            var grad = TYPE_GRAD[l.type]||['#333','#555'];
            var ownerRating = ratings[l.ownerId];
            return (
              <TouchableOpacity key={l.id} style={{backgroundColor:'#fff',borderRadius:R.xl2,marginBottom:S.lg,overflow:'hidden',elevation:6}} onPress={function(){router.push('/listing/'+l.id);}} activeOpacity={0.92}>
                <View style={{height:190,position:'relative'}}>
                  {l.media&&l.media[0]
                    ?<Image source={{uri:l.media[0].url}} style={{width:'100%',height:'100%'}} resizeMode="cover" />
                    :<LinearGradient colors={grad} style={{flex:1}} />}
                  <LinearGradient colors={['transparent','rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFillObject} />
                  <LinearGradient colors={grad} style={{position:'absolute',top:S.md,left:S.md,borderRadius:R.sm,paddingHorizontal:10,paddingVertical:4}} start={{x:0,y:0}} end={{x:1,y:0}}>
                    <Text style={{fontSize:F.xs,fontWeight:'800',color:'#fff',letterSpacing:0.5}}>{TYPE_LABEL[l.type]}</Text>
                  </LinearGradient>
                  {l.isVerified&&(
                    <View style={{position:'absolute',top:S.md,right:50,flexDirection:'row',alignItems:'center',backgroundColor:'rgba(201,150,58,0.9)',borderRadius:R.sm,paddingHorizontal:8,paddingVertical:3}}>
                      <Ionicons name="shield-checkmark" size={10} color="#fff" />
                      <Text style={{fontSize:F.xs,fontWeight:'700',color:'#fff'}}> Verifie</Text>
                    </View>
                  )}
                  <TouchableOpacity style={{position:'absolute',top:S.sm,right:S.md,width:38,height:38,borderRadius:19,backgroundColor:'rgba(0,0,0,0.3)',alignItems:'center',justifyContent:'center'}} onPress={function(){listingsModule.listingsStore.toggleFav(l.id, getToken());}}>
                    <Ionicons name={l.isFavorite?'heart':'heart-outline'} size={20} color={l.isFavorite?'#FF4040':'rgba(255,255,255,0.85)'} />
                  </TouchableOpacity>
                  <View style={{position:'absolute',bottom:S.md,left:S.md}}>
                    <Text style={{fontSize:F.xl,fontWeight:'900',color:'#fff'}}>{fmt(l.price)}<Text style={{fontSize:F.sm,fontWeight:'400'}}> F/mois</Text></Text>
                  </View>
                </View>
                <View style={{padding:S.md}}>
                  <Text style={{fontSize:F.md,fontWeight:'800',color:C.text,marginBottom:4}} numberOfLines={1}>{l.title}</Text>
                  <View style={{flexDirection:'row',alignItems:'center',gap:4,marginBottom:S.sm}}>
                    <Ionicons name="location" size={12} color={C.primary} />
                    <Text style={{fontSize:F.sm,color:C.muted,flex:1}}>{l.neighborhood}, {l.city}</Text>
                  </View>
                  <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:S.sm}}>
                    {l.isFurnished&&<View style={{backgroundColor:C.primaryLt,borderRadius:R.full,paddingHorizontal:9,paddingVertical:4}}><Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary}}>Meuble</Text></View>}
                    {l.hasWifi&&<View style={{backgroundColor:C.primaryLt,borderRadius:R.full,paddingHorizontal:9,paddingVertical:4}}><Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary}}>Wifi</Text></View>}
                    {l.hasAC&&<View style={{backgroundColor:C.primaryLt,borderRadius:R.full,paddingHorizontal:9,paddingVertical:4}}><Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary}}>Climatise</Text></View>}
                  </View>
                  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingTop:S.sm,borderTopWidth:0.5,borderTopColor:C.border}}>
                    <View style={{flexDirection:'row',alignItems:'center',gap:S.sm}}>
                      {isValidUrl(l.owner.avatar)
                        ? <Image source={{uri:l.owner.avatar}} style={{width:26,height:26,borderRadius:13}} />
                        : <LinearGradient colors={['#F0A830','#D4821A']} style={{width:26,height:26,borderRadius:13,alignItems:'center',justifyContent:'center'}}>
                            <Text style={{fontSize:10,fontWeight:'800',color:'#fff'}}>{l.owner.firstName[0]}{l.owner.lastName[0]}</Text>
                          </LinearGradient>
                      }
                      <Text style={{fontSize:F.xs,fontWeight:'600',color:C.muted}}>{l.owner.firstName} {l.owner.lastName}</Text>
                      {ownerRating&&<StarRating rating={ownerRating} />}
                    </View>
                    <View style={{flexDirection:'row',alignItems:'center',gap:3}}>
                      <Ionicons name="eye" size={12} color={C.gray} />
                      <Text style={{fontSize:F.xs,color:C.gray}}>{l.viewCount}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{height:20}} />
        </View>
      </ScrollView>
    </View>
  );
}