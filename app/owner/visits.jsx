import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
var hooks = require('../../src/store/hooks');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var STATUS = {
  CONFIRMED:{label:'Confirmee',color:'#059669',bg:'#05966922'},
  PENDING:{label:'En attente',color:'#D4821A',bg:'#FEF4E7'},
  CANCELLED:{label:'Annulee',color:'#DC2626',bg:'#DC262615'},
  COMPLETED:{label:'Completee',color:'#6366F1',bg:'#6366F115'},
};

function fmt(d) {
  var date = new Date(d);
  return date.toLocaleDateString('fr-SN',{weekday:'short',day:'numeric',month:'short'}) + ' a ' + date.toLocaleTimeString('fr-SN',{hour:'2-digit',minute:'2-digit'});
}

export default function OwnerVisits() {
  var visitsS = useState([]); var visits = visitsS[0]; var setVisits = visitsS[1];
  var refS = useState(false); var refreshing = refS[0]; var setRefreshing = refS[1];

  function load() {
    api.get('/visits/owner', getToken()).then(function(data) {
      setVisits(Array.isArray(data) ? data : []);
    }).catch(function(){});
  }

  function onRefresh() {
    setRefreshing(true);
    api.get('/visits/owner', getToken()).then(function(data) {
      setVisits(Array.isArray(data) ? data : []);
      setRefreshing(false);
    }).catch(function(){ setRefreshing(false); });
  }

  function handleStatus(id, status) {
    api.patch('/visits/'+id+'/status', {status:status}, getToken()).then(function() {
      load();
      Toast.show({
        type: status==='CONFIRMED'?'success':'error',
        text1: status==='CONFIRMED'?'Visite confirmee':'Visite refusee',
        text2: 'Le locataire sera notifie',
        visibilityTime: 2000,
      });
    });
  }

  useEffect(function() { load(); }, []);

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#0F2E22','#1B4F3A','#2D7A5F']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.xl,paddingTop:S.sm}}>
          <Text style={{fontSize:22,fontWeight:'900',color:'#fff'}}>Demandes de visites</Text>
          <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)',marginTop:2}}>{visits.length} demande{visits.length>1?'s':''}</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg,gap:S.md}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.owner]} />}>
        {visits.length===0&&(
          <View style={{alignItems:'center',paddingVertical:60}}>
            <Text style={{fontSize:48,marginBottom:12}}>📅</Text>
            <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Aucune demande</Text>
            <Text style={{fontSize:F.sm,color:C.muted,marginTop:8}}>Les demandes de visite apparaitront ici</Text>
          </View>
        )}
        {visits.map(function(v){
          var s = STATUS[v.status] || STATUS.PENDING;
          return (
            <View key={v.id} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,elevation:4}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:S.md}}>
                <View style={{flex:1,marginRight:S.md}}>
                  <Text style={{fontSize:F.base,fontWeight:'800',color:C.text,marginBottom:3}}>{v.tenant?v.tenant.firstName+' '+v.tenant.lastName:''}</Text>
                  <Text style={{fontSize:F.xs,color:C.muted,marginBottom:3}}>{v.tenant?v.tenant.phone:''}</Text>
                  <Text style={{fontSize:F.sm,fontWeight:'600',color:C.owner}} numberOfLines={1}>{v.listing?v.listing.title:''}</Text>
                </View>
                <View style={{borderRadius:R.full,paddingHorizontal:10,paddingVertical:4,backgroundColor:s.bg}}>
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:s.color}}>{s.label}</Text>
                </View>
              </View>
              <View style={{height:0.5,backgroundColor:C.border,marginBottom:S.md}} />
              <View style={{flexDirection:'row',alignItems:'center',gap:S.sm,marginBottom:S.md}}>
                <Ionicons name="calendar" size={14} color={C.owner} />
                <Text style={{fontSize:F.sm,color:C.textMd,fontWeight:'500'}}>{fmt(v.date)}</Text>
              </View>
              {v.status==='PENDING'&&(
                <View style={{flexDirection:'row',gap:S.sm}}>
                  <TouchableOpacity onPress={function(){handleStatus(v.id,'CONFIRMED');}} style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:10,borderRadius:R.lg,backgroundColor:'#05996922'}}>
                    <Ionicons name="checkmark-circle" size={16} color='#059669' />
                    <Text style={{fontSize:F.sm,fontWeight:'700',color:'#059669'}}>Confirmer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={function(){handleStatus(v.id,'CANCELLED');}} style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:10,borderRadius:R.lg,backgroundColor:'#FFF0F0'}}>
                    <Ionicons name="close-circle" size={16} color='#DC2626' />
                    <Text style={{fontSize:F.sm,fontWeight:'700',color:'#DC2626'}}>Refuser</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}