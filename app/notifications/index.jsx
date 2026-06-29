import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Animated, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
var AsyncStorage = require('@react-native-async-storage/async-storage').default;
var hooks = require('../../src/store/hooks');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var useAuth = hooks.useAuth;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var STORAGE_KEY = 'dkw_hidden_notifs';

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
  if (type === 'contract') return {icon:'document-text',color:'#7C3AED',bg:'#EDE9FE'};
  if (type === 'contract_signed') return {icon:'checkmark-circle',color:'#059669',bg:'#D1FAE5'};
  if (type === 'contract_rejected') return {icon:'close-circle',color:'#DC2626',bg:'#FEE2E2'};
  return {icon:'notifications',color:C.primary,bg:C.primaryLt};
}

function NotifItem({ n, onDismiss, onPress }) {
  var translateX = useRef(new Animated.Value(0)).current;
  var opacity = useRef(new Animated.Value(1)).current;
  var style = getNotifStyle(n.type);

  var panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: function(evt, gs) {
      return Math.abs(gs.dx) > 10 && Math.abs(gs.dy) < 20;
    },
    onPanResponderMove: function(evt, gs) {
      if (gs.dx < 0) translateX.setValue(gs.dx);
    },
    onPanResponderRelease: function(evt, gs) {
      if (gs.dx < -80) {
        Animated.parallel([
          Animated.timing(translateX, { toValue: -400, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(function() { onDismiss(n.id); });
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  });

  function handlePress() {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -400, duration: 150, useNativeDriver: true }),
    ]).start(function() {
      onDismiss(n.id);
      onPress(n);
    });
  }

  function handleClose() {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -400, duration: 200, useNativeDriver: true }),
    ]).start(function() { onDismiss(n.id); });
  }

  return (
    <Animated.View style={{transform:[{translateX:translateX}],opacity:opacity,marginBottom:S.sm}} {...panResponder.panHandlers}>
      <TouchableOpacity onPress={handlePress} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,flexDirection:'row',alignItems:'flex-start',gap:S.md,elevation:3}} activeOpacity={0.85}>
        <View style={{width:44,height:44,borderRadius:22,backgroundColor:style.bg,alignItems:'center',justifyContent:'center'}}>
          <Ionicons name={style.icon} size={22} color={style.color} />
        </View>
        <View style={{flex:1}}>
          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
            <Text style={{fontSize:F.base,fontWeight:'700',color:C.text,flex:1,paddingRight:S.sm}}>{n.title}</Text>
            <View style={{width:8,height:8,borderRadius:4,backgroundColor:C.primary}} />
          </View>
          <Text style={{fontSize:F.sm,color:C.muted,lineHeight:18}} numberOfLines={2}>{n.body}</Text>
          <Text style={{fontSize:F.xs,color:C.gray,marginTop:6}}>{timeAgo(n.date)}</Text>
        </View>
        <TouchableOpacity onPress={handleClose} style={{padding:4,marginTop:-4}}>
          <Ionicons name="close-circle" size={20} color={C.gray} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  var auth = useAuth(); var user = auth.user;
  var visitsS = useState([]); var visits = visitsS[0]; var setVisits = visitsS[1];
  var refS = useState(false); var refreshing = refS[0]; var setRefreshing = refS[1];
  var hiddenS = useState({}); var hidden = hiddenS[0]; var setHidden = hiddenS[1];
  var loadedS = useState(false); var loaded = loadedS[0]; var setLoaded = loadedS[1];
  var isOwner = user && user.role === 'OWNER';

  // Charger hidden depuis AsyncStorage
  useEffect(function() {
    AsyncStorage.getItem(STORAGE_KEY).then(function(raw) {
      if (raw) {
        try { setHidden(JSON.parse(raw)); } catch(e) {}
      }
      setLoaded(true);
    }).catch(function() { setLoaded(true); });
  }, []);

  function saveHidden(next) {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(function(){});
  }

  function dismiss(id) {
    setHidden(function(prev) {
      var next = Object.assign({}, prev, {[id]:true});
      saveHidden(next);
      return next;
    });
  }

  function dismissAll() {
    var all = {};
    notifs.forEach(function(n) { all[n.id] = true; });
    setHidden(function(prev) {
      var next = Object.assign({}, prev, all);
      saveHidden(next);
      return next;
    });
  }

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
        var title = v.status==='CONFIRMED'?'Visite confirmée':v.status==='CANCELLED'?'Visite annulée':'Demande en attente';
        var body = v.status==='CONFIRMED'
          ? 'Votre visite pour "'+(v.listing?v.listing.title:'')+'" a été confirmée'
          : v.status==='CANCELLED'
          ? 'Votre visite pour "'+(v.listing?v.listing.title:'')+'" a été annulée'
          : 'En attente de confirmation pour "'+(v.listing?v.listing.title:'')+'"';
        notifs.push({
          id: v.id+'_tenant',
          type: type,
          title: title,
          body: body,
          date: v.updatedAt||v.createdAt,
          route: '/tabs/visits',
        });
      }
    });
    return notifs.sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
  }

  function handlePress(n) {
    router.push(n.route);
  }

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

  var allNotifs = buildNotifs(visits);
  var notifs = allNotifs.filter(function(n){ return !hidden[n.id]; });

  if (!loaded) return (
    <View style={{flex:1,backgroundColor:C.bg,alignItems:'center',justifyContent:'center'}}>
      <Text style={{color:C.muted}}>Chargement...</Text>
    </View>
  );

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{flex:1}}>
              <Text style={{fontSize:22,fontWeight:'900',color:'#fff'}}>Notifications</Text>
              <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)'}}>{notifs.length} notification{notifs.length!==1?'s':''}</Text>
            </View>
            {notifs.length>0&&(
              <TouchableOpacity onPress={dismissAll} style={{backgroundColor:'rgba(255,255,255,0.15)',borderRadius:R.full,paddingHorizontal:S.md,paddingVertical:6}}>
                <Text style={{fontSize:F.xs,fontWeight:'700',color:'#fff'}}>Tout effacer</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}>
        {notifs.length>0&&(
          <View style={{backgroundColor:'rgba(0,0,0,0.04)',borderRadius:R.lg,padding:S.md,marginBottom:S.lg,flexDirection:'row',alignItems:'center',gap:S.sm}}>
            <Ionicons name="information-circle-outline" size={16} color={C.muted} />
            <Text style={{fontSize:F.xs,color:C.muted}}>Glissez vers la gauche ou appuyez sur ✕ pour supprimer</Text>
          </View>
        )}

        {notifs.length===0&&(
          <View style={{alignItems:'center',paddingVertical:60}}>
            <Text style={{fontSize:48,marginBottom:12}}>🔔</Text>
            <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Aucune notification</Text>
            <Text style={{fontSize:F.sm,color:C.muted,marginTop:8}}>Vos notifications apparaîtront ici</Text>
          </View>
        )}

        {notifs.map(function(n){
          return <NotifItem key={n.id} n={n} onDismiss={dismiss} onPress={handlePress} />;
        })}

        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}