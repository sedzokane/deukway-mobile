import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
var hooks = require('../../src/store/hooks');
var listingsModule = require('../../src/store/listings');
var authModule = require('../../src/store/auth');
var apiModule = require('../../src/api/client');
var chatModule = require('../../src/store/chat');
var api = apiModule.api;
var useAuth = hooks.useAuth;
var useListings = hooks.useListings;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;
var W = Dimensions.get('window').width;

var QUICK = [
  {icon:'add-circle',label:'Publier',sub:'Nouvelle annonce',grad:['#243D61','#1A2E4A'],route:'/owner/publish'},
  {icon:'home',label:'Mes biens',sub:'Gerer',grad:['#0A8754','#065C39'],route:'/owner/listings'},
  {icon:'chatbubbles',label:'Messages',sub:'Inbox',grad:['#1A56DB','#1040AA'],route:'/chat'},
  {icon:'calendar',label:'Visites',sub:'Calendrier',grad:['#C87A0A','#8F5608'],route:'/owner/visits'},
];

function fmt(p) { return new Intl.NumberFormat('fr-SN').format(p); }

export default function Dashboard() {
  var auth = useAuth(); var user = auth.user;
  var store = useListings();
  var visitsS = useState([]); var visits = visitsS[0]; var setVisits = visitsS[1];
  var unreadS = useState(0); var unread = unreadS[0]; var setUnread = unreadS[1];

  useEffect(function(){
    if (!user) return;
    var token = getToken();
    listingsModule.listingsStore.fetchMyListings(token);
    api.get('/visits/owner', token).then(function(data) {
      setVisits(Array.isArray(data) ? data : []);
    }).catch(function(){});
    api.get('/chat/unread/count', token).then(function(data) {
      setUnread(data || 0);
    }).catch(function(){});
    if (!chatModule.chatStore.getState().socket) {
      chatModule.chatStore.connect(token, user.id);
    }
    var unsub = chatModule.chatStore.subscribe(function(state) {
      if (!user) return;
      if (state.messages.length > 0) {
        var last = state.messages[state.messages.length - 1];
        if (last && last.sender && last.sender.id !== user.id) {
          setUnread(function(n) { return n + 1; });
        }
      }
    });
    return function() { unsub(); };
  }, [user]);

  var myListings = Array.isArray(store.myListings) ? store.myListings : [];
  var pendingVisits = visits.filter(function(v){ return v.status==='PENDING'; });
  var totalViews = myListings.reduce(function(acc,l){ return acc + (l.viewCount||0); }, 0);

  var STATS = [
    {icon:'home',label:'Annonces',val:String(myListings.length),color:'#D4821A',bg:'#FEF4E7'},
    {icon:'calendar',label:'Visites',val:String(visits.length),color:'#1A56DB',bg:'#EBF3FF'},
    {icon:'time',label:'En attente',val:String(pendingVisits.length),color:'#1A2E4A',bg:'#EBF0F7'},
    {icon:'eye',label:'Vues',val:String(totalViews),color:'#C9963A',bg:'#FBF4DF'},
  ];

  function handleLogout() {
    Toast.show({
      type: 'error',
      text1: 'Deconnexion',
      text2: 'Vous avez ete deconnecte avec succes',
      visibilityTime: 2000,
      onHide: function() {
        chatModule.chatStore.disconnect();
        authModule.authStore.logout();
      }
    });
  }

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0F2E22','#1B4F3A','#2D7A5F']} style={{paddingHorizontal:S.xl,paddingBottom:S.xl}}>
          <SafeAreaView edges={['top']}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:S.lg}}>
              <View>
                <View style={{flexDirection:'row',alignItems:'center',alignSelf:'flex-start',backgroundColor:'rgba(255,255,255,0.12)',borderRadius:R.sm,paddingHorizontal:10,paddingVertical:5,marginBottom:S.sm,borderWidth:0.5,borderColor:'rgba(255,255,255,0.2)'}}>
                  <Ionicons name="key" size={11} color="rgba(255,255,255,0.8)" />
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:'rgba(255,255,255,0.8)',letterSpacing:1.5,marginLeft:5}}>PROPRIETAIRE</Text>
                </View>
                <Text style={{fontSize:22,fontWeight:'900',color:'#fff',lineHeight:30}}>Bonjour,{'\n'}{user?user.firstName:''} 👋</Text>
              </View>
              <View style={{flexDirection:'row',gap:S.sm}}>
                <TouchableOpacity style={{width:42,height:42,borderRadius:21,backgroundColor:'rgba(255,255,255,0.12)',alignItems:'center',justifyContent:'center'}} onPress={function(){router.push('/chat');}}>
                  <Ionicons name="chatbubbles" size={22} color="#fff" />
                  {unread>0&&<View style={{position:'absolute',top:6,right:6,width:9,height:9,borderRadius:5,backgroundColor:'#FF4040',borderWidth:1.5,borderColor:'rgba(255,255,255,0.8)'}} />}
                </TouchableOpacity>
                <TouchableOpacity style={{width:42,height:42,borderRadius:21,backgroundColor:'rgba(255,255,255,0.12)',alignItems:'center',justifyContent:'center'}} onPress={function(){router.push('/notifications');}}>
                  <Ionicons name="notifications" size={22} color="#fff" />
                  {pendingVisits.length>0&&<View style={{position:'absolute',top:6,right:6,width:9,height:9,borderRadius:5,backgroundColor:C.primary,borderWidth:1.5,borderColor:'rgba(255,255,255,0.8)'}} />}
                </TouchableOpacity>
                <TouchableOpacity style={{width:42,height:42,borderRadius:21,backgroundColor:'rgba(255,255,255,0.12)',alignItems:'center',justifyContent:'center'}} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{flexDirection:'row',gap:S.sm}}>
              {QUICK.map(function(q,i){
                return (
                  <TouchableOpacity key={i} style={{flex:1,borderRadius:R.xl,overflow:'hidden'}} onPress={function(){router.push(q.route);}} activeOpacity={0.85}>
                    <LinearGradient colors={q.grad} style={{padding:S.md,minHeight:88,justifyContent:'flex-end',gap:2}}>
                      <Ionicons name={q.icon} size={22} color="#fff" />
                      <Text style={{fontSize:F.base,fontWeight:'800',color:'#fff'}}>{q.label}</Text>
                      <Text style={{fontSize:F.xs,color:'rgba(255,255,255,0.65)'}}>{q.sub}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={{paddingHorizontal:S.lg,paddingTop:S.xl}}>
          <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text,letterSpacing:-0.2,marginBottom:S.md}}>Tableau de bord</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:S.sm,marginBottom:S.xl}}>
            {STATS.map(function(s,i){
              return (
                <View key={i} style={{width:(W-S.lg*2-S.sm)/2,borderRadius:R.xl,padding:S.lg,gap:4,backgroundColor:s.bg}}>
                  <Ionicons name={s.icon} size={26} color={s.color} />
                  <Text style={{fontSize:26,fontWeight:'900',color:s.color}}>{s.val}</Text>
                  <Text style={{fontSize:F.xs,color:C.muted}}>{s.label}</Text>
                </View>
              );
            })}
          </View>

          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:S.md}}>
            <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Mes annonces</Text>
            <TouchableOpacity onPress={function(){router.push('/owner/listings');}}><Text style={{fontSize:F.sm,fontWeight:'700',color:C.owner}}>Gerer →</Text></TouchableOpacity>
          </View>

          {myListings.length===0&&(
            <View style={{alignItems:'center',paddingVertical:30,backgroundColor:'#fff',borderRadius:R.xl,marginBottom:S.md}}>
              <Text style={{fontSize:36,marginBottom:8}}>🏠</Text>
              <Text style={{fontSize:F.base,fontWeight:'700',color:C.text}}>Aucune annonce</Text>
              <TouchableOpacity onPress={function(){router.push('/owner/publish');}} style={{marginTop:S.md,backgroundColor:C.owner,borderRadius:R.xl,paddingHorizontal:S.xl,paddingVertical:10}}>
                <Text style={{fontSize:F.sm,fontWeight:'700',color:'#fff'}}>Publier une annonce</Text>
              </TouchableOpacity>
            </View>
          )}

          {myListings.slice(0,3).map(function(l){
            return (
              <TouchableOpacity key={l.id} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.md,marginBottom:S.md,flexDirection:'row',alignItems:'center',justifyContent:'space-between',elevation:3}} onPress={function(){router.push('/listing/'+l.id);}} activeOpacity={0.88}>
                <View style={{flex:1,marginRight:S.md}}>
                  <Text style={{fontSize:F.base,fontWeight:'800',color:C.text}} numberOfLines={1}>{l.title}</Text>
                  <View style={{flexDirection:'row',alignItems:'center',gap:4,marginTop:3}}>
                    <Ionicons name="location" size={11} color={C.muted} />
                    <Text style={{fontSize:F.xs,color:C.muted}}>{l.neighborhood}</Text>
                  </View>
                  <Text style={{fontSize:F.md,fontWeight:'700',color:C.primary,marginTop:4}}>{fmt(l.price)} F/mois</Text>
                </View>
                <View style={{alignItems:'flex-end',gap:6}}>
                  <View style={{borderRadius:R.full,paddingHorizontal:10,paddingVertical:4,backgroundColor:'#05996922'}}>
                    <Text style={{fontSize:F.xs,fontWeight:'700',color:'#059669'}}>Active</Text>
                  </View>
                  <View style={{flexDirection:'row',alignItems:'center',gap:3}}>
                    <Ionicons name="eye" size={12} color={C.gray} />
                    <Text style={{fontSize:F.xs,color:C.gray}}>{l.viewCount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={{flexDirection:'row',alignItems:'flex-start',gap:S.md,backgroundColor:C.ownerLt,borderRadius:R.xl,padding:S.lg,marginTop:S.sm,borderWidth:0.5,borderColor:C.owner+'22'}}>
            <Ionicons name="bulb" size={22} color={C.owner} />
            <View style={{flex:1}}>
              <Text style={{fontSize:F.base,fontWeight:'700',color:C.owner,marginBottom:4}}>Conseil du jour</Text>
              <Text style={{fontSize:F.sm,color:C.textMd,lineHeight:20}}>Les annonces avec 5+ photos recoivent 3x plus de demandes !</Text>
            </View>
          </View>
          <View style={{height:30}} />
        </View>
      </ScrollView>
    </View>
  );
}