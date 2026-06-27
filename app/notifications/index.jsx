import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
var hooks = require('../../src/store/hooks');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var useAuth = hooks.useAuth;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

function timeAgo(date) {
  var now = new Date();
  var d = new Date(date);
  var diff = Math.floor((now - d) / 60000);
  if (diff < 1) return 'maintenant';
  if (diff < 60) return diff + 'min';
  if (diff < 1440) return Math.floor(diff/60) + 'h';
  return Math.floor(diff/1440) + 'j';
}

function getNotifStyle(type) {
  if (type === 'visit_pending') return {icon:'calendar',color:'#1A56DB',bg:'#EBF3FF'};
  if (type === 'visit_confirmed') return {icon:'checkmark-circle',color:'#059669',bg:'#05966922'};
  if (type === 'visit_cancelled') return {icon:'close-circle',color:'#DC2626',bg:'#FFF0F0'};
  if (type === 'message') return {icon:'chatbubble',color:'#D4821A',bg:'#FEF4E7'};
  return {icon:'notifications',color:C.primary,bg:C.primaryLt};
}

export default function NotificationsScreen() {
  var auth = useAuth(); var user = auth.user;
  var visitsS = useState([]); var visits = visitsS[0]; var setVisits = visitsS[1];
  var refS = useState(false); var refreshing = refS[0]; var setRefreshing = refS[1];
  var readS = useState({}); var read = readS[0]; var setRead = readS[1];
  var hiddenS = useState({}); var hidden = hiddenS[0]; var setHidden = hiddenS[1];
  var timers = useRef({});
  var isOwner = user && user.role === 'OWNER';

  function buildNotifs(visits) {
    var notifs = [];
    visits.forEach(function(v) {
      if (isOwner) {
        notifs.push({
          id: v.id+'_owner',
          type: 'visit_pending',
          title: 'Nouvelle demande de visite',
          body: (v.tenant?v.tenant.firstName+' '+v.tenant.lastName:'') + ' veut visiter ' + (v.listing?v.listing.title:''),
          date: v.createdAt,
          route: '/owner/visits',
        });
      } else {
        var type = v.status==='CONFIRMED'?'visit_confirmed':v.status==='CANCELLED'?'visit_cancelled':'visit_pending';
        var body = v.status==='CONFIRMED'
          ? 'Votre visite pour "'+(v.listing?v.listing.title:'')+'" a ete confirmee'
          : v.status==='CANCELLED'
          ? 'Votre visite pour "'+(v.listing?v.listing.title:'')+'" a ete annulee'
          : 'En attente de confirmation pour "'+(v.listing?v.listing.title:'')+'"';
        notifs.push({
          id: v.id+'_tenant',
          type: type,
          title: v.status==='CONFIRMED'?'Visite confirmee':v.status==='CANCELLED'?'Visite annulee':'Demande en attente',
          body: body,
          date: v.updatedAt||v.createdAt,
          route: '/tabs/visits',
        });
      }
    });
    return notifs.sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
  }

  function handlePress(n) {
    if (read[n.id]) return;
    setRead(function(prev) { return Object.assign({}, prev, {[n.id]:true}); });
    timers.current[n.id] = setTimeout(function() {
      setHidden(function(prev) { return Object.assign({}, prev, {[n.id]:true}); });
    }, 60000);
    router.push(n.route);
  }

  useEffect(function() {
    return function() {
      Object.values(timers.current).forEach(function(t) { clearTimeout(t); });
    };
  }, []);

  function load() {
    var endpoint = isOwner ? '/visits/owner' : '/visits/my';
    api.get(endpoint, getToken()).then(function(data) {
      setVisits(Array.isArray(data) ? data : []);
    }).catch(function(){});
  }

  function onRefresh() {
    setRefreshing(true);
    var endpoint = isOwner ? '/visits/owner' : '/visits/my';
    api.get(endpoint, getToken()).then(function(data) {
      setVisits(Array.isArray(data) ? data : []);
      setRefreshing(false);
    }).catch(function(){ setRefreshing(false); });
  }

  useEffect(function() { load(); }, []);

  var notifs = buildNotifs(visits).filter(function(n){ return !hidden[n.id]; });

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={{fontSize:22,fontWeight:'900',color:'#fff'}}>Notifications</Text>
              <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)'}}>{notifs.length} notification{notifs.length>1?'s':''}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg,gap:S.sm}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}>
        {notifs.length===0&&(
          <View style={{alignItems:'center',paddingVertical:60}}>
            <Text style={{fontSize:48,marginBottom:12}}>🔔</Text>
            <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Aucune notification</Text>
            <Text style={{fontSize:F.sm,color:C.muted,marginTop:8}}>Vos notifications apparaitront ici</Text>
          </View>
        )}
        {notifs.map(function(n){
          var style = getNotifStyle(n.type);
          var isRead = !!read[n.id];
          return (
            <TouchableOpacity key={n.id} onPress={function(){handlePress(n);}} style={{backgroundColor:isRead?'#F8F8F8':'#fff',borderRadius:R.xl,padding:S.lg,flexDirection:'row',alignItems:'flex-start',gap:S.md,elevation:isRead?1:3,opacity:isRead?0.6:1}} activeOpacity={0.85}>
              <View style={{width:44,height:44,borderRadius:22,backgroundColor:style.bg,alignItems:'center',justifyContent:'center'}}>
                <Ionicons name={style.icon} size={22} color={style.color} />
              </View>
              <View style={{flex:1}}>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                  <Text style={{fontSize:F.base,fontWeight:isRead?'500':'700',color:isRead?C.muted:C.text}}>{n.title}</Text>
                  {!isRead&&<View style={{width:8,height:8,borderRadius:4,backgroundColor:C.primary}} />}
                </View>
                <Text style={{fontSize:F.sm,color:C.muted,lineHeight:18}} numberOfLines={2}>{n.body}</Text>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:6}}>
                  <Text style={{fontSize:F.xs,color:C.gray}}>{timeAgo(n.date)}</Text>
                  {isRead&&<Text style={{fontSize:F.xs,color:C.gray}}>Disparait dans 1 min</Text>}
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