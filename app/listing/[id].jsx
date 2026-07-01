import { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Linking, Modal, Platform, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
var hooks = require('../../src/store/hooks');
var listingsModule = require('../../src/store/listings');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var useAuth = hooks.useAuth;
var useListings = hooks.useListings;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;
var W = Dimensions.get('window').width;

var HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];

function fmt(p) { return new Intl.NumberFormat('fr-SN').format(p); }
function addDays(d, n) { var r = new Date(d); r.setDate(r.getDate()+n); return r; }
function fmtDay(d) { return d.toLocaleDateString('fr-SN',{weekday:'short',day:'numeric',month:'short'}); }
function isSameDay(a, b) { return a.getDate()===b.getDate()&&a.getMonth()===b.getMonth()&&a.getFullYear()===b.getFullYear(); }
function isValidUrl(url) { return url && (url.startsWith('http://') || url.startsWith('https://')); }

function Stars({ rating, count }) {
  return (
    <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
      {[1,2,3,4,5].map(function(s) {
        return <Ionicons key={s} name={s<=Math.round(rating)?'star':'star-outline'} size={14} color="#F59E0B" />;
      })}
      <Text style={{fontSize:F.xs,color:C.muted,marginLeft:2}}>{rating>0?rating.toFixed(1):''} {count>0?'('+count+' avis)':''}</Text>
    </View>
  );
}

export default function ListingDetail() {
  var params = useLocalSearchParams(); var id = params.id;
  var auth = useAuth(); var user = auth.user;
  var store = useListings();
  var imgS = useState(0); var imgIdx = imgS[0]; var setImgIdx = imgS[1];
  var modalS = useState(false); var modal = modalS[0]; var setModal = modalS[1];
  var selectedDayS = useState(addDays(new Date(),1)); var selectedDay = selectedDayS[0]; var setSelectedDay = selectedDayS[1];
  var selectedHourS = useState('10:00'); var selectedHour = selectedHourS[0]; var setSelectedHour = selectedHourS[1];
  var msgS = useState(''); var msg = msgS[0]; var setMsg = msgS[1];
  var loadingS = useState(false); var loading = loadingS[0]; var setLoading = loadingS[1];
  var reviewsS = useState({reviews:[],average:0,count:0}); var reviews = reviewsS[0]; var setReviews = reviewsS[1];
  var showReviewsS = useState(false); var showReviews = showReviewsS[0]; var setShowReviews = showReviewsS[1];

  useEffect(function() {
    if(id) listingsModule.listingsStore.fetchOne(id, getToken());
  }, [id]);

  useEffect(function() {
    if(store.current && store.current.ownerId) {
      api.get('/reviews/user/'+store.current.ownerId, getToken()).then(function(data) {
        if (data && data.reviews) setReviews(data);
      }).catch(function(){});
    }
  }, [store.current]);

  var l = store.current;
  var isOwner = user && user.role === 'OWNER';
  var isMyListing = l && user && l.ownerId === user.id;

  if(!l || l.id !== id) {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#fff'}}>
        <Text style={{fontSize:36,marginBottom:12}}>⏳</Text>
        <Text style={{color:C.muted}}>Chargement...</Text>
      </View>
    );
  }

  var allPhotos = l.media && l.media.length > 0 ? l.media : [];
  var days = [0,1,2,3,4,5,6].map(function(i){ return addDays(new Date(), i+1); });

  function handleReserve() {
    var parts = selectedHour.split(':');
    var visitDate = new Date(selectedDay);
    visitDate.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
    setLoading(true);
    api.post('/visits', {
      listingId: l.id,
      date: visitDate.toISOString(),
      message: msg,
    }, getToken()).then(function() {
      setLoading(false);
      setModal(false);
      Alert.alert('Demande envoyee !','Le proprietaire va confirmer votre visite bientot.');
    }).catch(function() {
      setLoading(false);
      Alert.alert('Erreur','Impossible de reserver la visite');
    });
  }

  function openMaps() {
    var query = encodeURIComponent((l.address||l.neighborhood)+', '+l.city+', Senegal');
    if (l.latitude && l.longitude) {
      Linking.openURL('https://www.google.com/maps?q='+l.latitude+','+l.longitude);
    } else {
      Linking.openURL('https://www.google.com/maps/search/'+query);
    }
  }

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
          {!isOwner&&(
            <TouchableOpacity style={{width:38,height:38,borderRadius:19,backgroundColor:'rgba(255,255,255,0.92)',alignItems:'center',justifyContent:'center',elevation:2}} onPress={function(){listingsModule.listingsStore.toggleFav(l.id, getToken());}}>
              <Ionicons name={l.isFavorite?'heart':'heart-outline'} size={20} color={l.isFavorite?C.danger:C.text} />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {allPhotos.length > 0 ? (
          <>
            <View style={{height:280,position:'relative'}}>
              <Image source={{uri:allPhotos[imgIdx]?allPhotos[imgIdx].url:''}} style={{width:W,height:280}} resizeMode="cover" />
              <LinearGradient colors={['transparent','rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFillObject} />
              {l.isVerified&&(
                <View style={{position:'absolute',bottom:S.md,left:S.lg,flexDirection:'row',alignItems:'center',backgroundColor:'rgba(201,150,58,0.92)',borderRadius:R.sm,paddingHorizontal:10,paddingVertical:4}}>
                  <Ionicons name="shield-checkmark" size={12} color="#fff" />
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:'#fff'}}> Verifie</Text>
                </View>
              )}
              <View style={{position:'absolute',bottom:S.md,right:S.lg,flexDirection:'row',alignItems:'center',backgroundColor:'rgba(0,0,0,0.45)',borderRadius:R.md,paddingHorizontal:8,paddingVertical:3}}>
                <Ionicons name="camera" size={12} color="#fff" />
                <Text style={{fontSize:F.xs,color:'#fff'}}> {imgIdx+1}/{allPhotos.length}</Text>
              </View>
            </View>
            {allPhotos.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{backgroundColor:'#fff'}} contentContainerStyle={{gap:4,padding:8,paddingHorizontal:S.lg}}>
                {allPhotos.map(function(p,i){
                  return (
                    <TouchableOpacity key={p.id} onPress={function(){setImgIdx(i);}} style={{width:64,height:46,borderRadius:8,overflow:'hidden',borderWidth:2,borderColor:imgIdx===i?C.primary:'transparent'}}>
                      <Image source={{uri:p.url}} style={{width:'100%',height:'100%'}} resizeMode="cover" />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </>
        ) : (
          <View style={{height:280,backgroundColor:C.border,alignItems:'center',justifyContent:'center'}}>
            <Ionicons name="image-outline" size={48} color={C.gray} />
            <Text style={{fontSize:F.sm,color:C.muted,marginTop:8}}>Aucune photo disponible</Text>
          </View>
        )}

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
            {l.surface&&<View style={{flex:1,backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,alignItems:'center'}}><Text style={{fontSize:F.md,fontWeight:'800',color:C.text}}>{l.surface} m2</Text><Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>Surface</Text></View>}
            {l.rooms&&<View style={{flex:1,backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,alignItems:'center'}}><Text style={{fontSize:F.md,fontWeight:'800',color:C.text}}>{l.rooms}</Text><Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>Pieces</Text></View>}
            {l.deposit&&<View style={{flex:1,backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,alignItems:'center'}}><Text style={{fontSize:F.sm,fontWeight:'800',color:C.text,textAlign:'center'}}>{fmt(l.deposit)}F</Text><Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>Caution</Text></View>}
            <View style={{flex:1,backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,alignItems:'center'}}><Text style={{fontSize:F.md,fontWeight:'800',color:'#059669'}}>Dispo</Text><Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>Maintenant</Text></View>
          </View>

          <Text style={{fontSize:F.md,fontWeight:'800',color:C.text,marginBottom:S.md}}>Equipements</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:S.xl}}>
            {[
              [l.isFurnished,'bed','Meuble'],
              [l.hasElectricity,'flash','Electricite'],
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

          <Text style={{fontSize:F.md,fontWeight:'800',color:C.text,marginBottom:S.md}}>Localisation</Text>
          <TouchableOpacity onPress={openMaps} style={{flexDirection:'row',alignItems:'center',gap:S.md,backgroundColor:C.primaryLt,borderRadius:R.xl,padding:S.md,marginBottom:S.xl,borderWidth:0.5,borderColor:'rgba(212,130,26,0.2)'}}>
            <View style={{width:44,height:44,borderRadius:22,backgroundColor:C.primary,alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="map" size={22} color="#fff" />
            </View>
            <View style={{flex:1}}>
              <Text style={{fontSize:F.base,fontWeight:'700',color:C.text}}>{l.neighborhood}, {l.city}</Text>
              <Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>{l.address||'Voir sur la carte'}</Text>
              {l.latitude&&<Text style={{fontSize:F.xs,color:C.primary,marginTop:2}}>GPS: {l.latitude.toFixed(4)}, {l.longitude.toFixed(4)}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.primary} />
          </TouchableOpacity>

          <Text style={{fontSize:F.md,fontWeight:'800',color:C.text,marginBottom:S.md}}>Propriétaire</Text>
          <View style={{backgroundColor:C.bg,borderRadius:R.xl,padding:S.md,marginBottom:S.md}}>
            <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
              {isValidUrl(l.owner.avatar)
                ? <Image source={{uri:l.owner.avatar}} style={{width:52,height:52,borderRadius:26}} />
                : <LinearGradient colors={['#F0A830','#D4821A']} style={{width:52,height:52,borderRadius:26,alignItems:'center',justifyContent:'center'}}>
                    <Text style={{fontSize:18,fontWeight:'900',color:'#fff'}}>{l.owner.firstName[0]}{l.owner.lastName[0]}</Text>
                  </LinearGradient>
              }
              <View style={{flex:1}}>
                <Text style={{fontSize:F.base,fontWeight:'700',color:C.text}}>{l.owner.firstName} {l.owner.lastName}</Text>
                {reviews.count>0
                  ? <Stars rating={reviews.average} count={reviews.count} />
                  : <Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>Aucun avis pour le moment</Text>
                }
                <Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>{l.viewCount} vues</Text>
              </View>
              {!isOwner&&(
                <View style={{flexDirection:'row',gap:8}}>
                  <TouchableOpacity style={{width:40,height:40,borderRadius:20,backgroundColor:'#fff',borderWidth:0.5,borderColor:C.border,alignItems:'center',justifyContent:'center'}} onPress={function(){Linking.openURL('https://wa.me/'+l.owner.phone.replace(/[\s+]/g,''));}}>
                    <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                  </TouchableOpacity>
                  <TouchableOpacity style={{width:40,height:40,borderRadius:20,backgroundColor:'#fff',borderWidth:0.5,borderColor:C.border,alignItems:'center',justifyContent:'center'}} onPress={function(){Linking.openURL('tel:'+l.owner.phone);}}>
                    <Ionicons name="call" size={18} color={C.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {reviews.count>0&&(
            <View style={{marginBottom:S.xl}}>
              <TouchableOpacity onPress={function(){setShowReviews(!showReviews);}} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:S.md}}>
                <Text style={{fontSize:F.base,fontWeight:'800',color:C.text}}>Avis ({reviews.count})</Text>
                <Ionicons name={showReviews?'chevron-up':'chevron-down'} size={18} color={C.muted} />
              </TouchableOpacity>
              {showReviews&&reviews.reviews.slice(0,5).map(function(r) {
                return (
                  <View key={r.id} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.sm,elevation:2}}>
                    <View style={{flexDirection:'row',alignItems:'center',gap:S.md,marginBottom:S.sm}}>
                      {isValidUrl(r.reviewer&&r.reviewer.avatar)
                        ? <Image source={{uri:r.reviewer.avatar}} style={{width:36,height:36,borderRadius:18}} />
                        : <LinearGradient colors={['#F0A830','#D4821A']} style={{width:36,height:36,borderRadius:18,alignItems:'center',justifyContent:'center'}}>
                            <Text style={{fontSize:13,fontWeight:'900',color:'#fff'}}>{r.reviewer?r.reviewer.firstName[0]:''}</Text>
                          </LinearGradient>
                      }
                      <View style={{flex:1}}>
                        <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text}}>{r.reviewer?r.reviewer.firstName+' '+r.reviewer.lastName:'—'}</Text>
                        <Stars rating={r.rating} count={0} />
                      </View>
                      <Text style={{fontSize:F.xs,color:C.gray}}>{new Date(r.createdAt).toLocaleDateString('fr-SN')}</Text>
                    </View>
                    {r.comment&&<Text style={{fontSize:F.sm,color:C.muted,lineHeight:18,fontStyle:'italic'}}>"{r.comment}"</Text>}
                  </View>
                );
              })}
            </View>
          )}

          <View style={{height:100}} />
        </View>
      </ScrollView>

      {!isOwner&&(
        <SafeAreaView style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#fff',borderTopWidth:0.5,borderTopColor:C.border,paddingHorizontal:S.lg,paddingTop:S.md,flexDirection:'row',gap:10}} edges={['bottom']}>
          <TouchableOpacity style={{width:48,height:48,borderRadius:R.lg,borderWidth:1,borderColor:C.border,alignItems:'center',justifyContent:'center'}} onPress={function(){router.push('/chat/'+l.owner.id);}}>
            <Ionicons name="chatbubble-ellipses" size={20} color={C.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={{flex:1}} onPress={function(){setModal(true);}} activeOpacity={0.88}>
            <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:14,alignItems:'center',borderRadius:R.xl}}>
              <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>Reserver une visite</Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      {isOwner&&isMyListing&&(
        <SafeAreaView style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#fff',borderTopWidth:0.5,borderTopColor:C.border,paddingHorizontal:S.lg,paddingTop:S.md,flexDirection:'row',gap:10}} edges={['bottom']}>
          <TouchableOpacity style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,backgroundColor:C.ownerLt,borderRadius:R.xl,paddingVertical:14}} onPress={function(){router.push('/owner/listings');}}>
            <Ionicons name="create" size={18} color={C.owner} />
            <Text style={{fontSize:F.md,fontWeight:'800',color:C.owner}}>Modifier l annonce</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      <Modal visible={modal} animationType="slide" transparent onRequestClose={function(){setModal(false);}}>
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'}}>
          <View style={{backgroundColor:'#fff',borderRadius:24,borderBottomLeftRadius:0,borderBottomRightRadius:0,padding:S.xl,maxHeight:'85%'}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:S.lg}}>
              <Text style={{fontSize:F.lg,fontWeight:'900',color:C.text}}>Reserver une visite</Text>
              <TouchableOpacity onPress={function(){setModal(false);}}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>

            <Text style={{fontSize:F.xs,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.md}}>Choisir un jour</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:S.lg}}>
              <View style={{flexDirection:'row',gap:S.sm}}>
                {days.map(function(d,i){
                  var active = isSameDay(d, selectedDay);
                  return (
                    <TouchableOpacity key={i} onPress={function(){setSelectedDay(d);}} style={{width:64,alignItems:'center',paddingVertical:S.md,borderRadius:R.xl,borderWidth:1.5,borderColor:active?C.primary:C.border,backgroundColor:active?C.primaryLt:'#fff'}}>
                      <Text style={{fontSize:F.xs,color:active?C.primary:C.muted,fontWeight:'600'}}>{fmtDay(d).split(' ')[0]}</Text>
                      <Text style={{fontSize:20,fontWeight:'900',color:active?C.primary:C.text,marginTop:2}}>{d.getDate()}</Text>
                      <Text style={{fontSize:F.xs,color:active?C.primary:C.muted}}>{fmtDay(d).split(' ')[2]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={{fontSize:F.xs,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.md}}>Choisir une heure</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:S.lg}}>
              <View style={{flexDirection:'row',gap:S.sm}}>
                {HOURS.map(function(h){
                  var active = h === selectedHour;
                  return (
                    <TouchableOpacity key={h} onPress={function(){setSelectedHour(h);}} style={{paddingHorizontal:S.md,paddingVertical:S.sm,borderRadius:R.full,borderWidth:1.5,borderColor:active?C.primary:C.border,backgroundColor:active?C.primary:'#fff'}}>
                      <Text style={{fontSize:F.sm,fontWeight:'700',color:active?'#fff':C.text}}>{h}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={{backgroundColor:C.primaryLt,borderRadius:R.lg,padding:S.md,marginBottom:S.lg,flexDirection:'row',alignItems:'center',gap:S.sm}}>
              <Ionicons name="calendar-outline" size={18} color={C.primary} />
              <Text style={{fontSize:F.sm,color:C.primary,fontWeight:'600'}}>{fmtDay(selectedDay)} a {selectedHour}</Text>
            </View>

            <Text style={{fontSize:F.xs,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.sm}}>Message (optionnel)</Text>
            <TextInput
              style={{backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,fontSize:F.base,color:C.text,borderWidth:1,borderColor:C.border,marginBottom:S.lg,height:70,textAlignVertical:'top'}}
              placeholder="Ex: Je suis disponible le matin..."
              placeholderTextColor={C.gray}
              value={msg}
              onChangeText={setMsg}
              multiline
            />

            <TouchableOpacity onPress={handleReserve} disabled={loading} activeOpacity={0.88} style={{borderRadius:R.xl,overflow:'hidden',opacity:loading?0.6:1}}>
              <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:16,alignItems:'center'}}>
                <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>{loading?'Envoi...':'Envoyer la demande'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}