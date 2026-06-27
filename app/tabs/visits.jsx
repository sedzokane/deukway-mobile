import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
var hooks = require('../../src/store/hooks');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var useAuth = hooks.useAuth;
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

export default function Visits() {
  var auth = useAuth();
  var visitsS = useState([]); var visits = visitsS[0]; var setVisits = visitsS[1];
  var loadingS = useState(false); var loading = loadingS[0]; var setLoading = loadingS[1];
  var refS = useState(false); var refreshing = refS[0]; var setRefreshing = refS[1];

  function load() {
    setLoading(true);
    api.get('/visits/my', getToken()).then(function(data) {
      setVisits(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }

  function onRefresh() {
    setRefreshing(true);
    api.get('/visits/my', getToken()).then(function(data) {
      setVisits(Array.isArray(data) ? data : []);
      setRefreshing(false);
    }).catch(function() { setRefreshing(false); });
  }

  function handleCancel(id) {
    api.patch('/visits/'+id+'/cancel', {}, getToken()).then(function() {
      load();
    });
  }

  useEffect(function() { load(); }, []);

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <SafeAreaView edges={['top']} style={{backgroundColor:'#fff',paddingHorizontal:S.lg,paddingBottom:S.md,borderBottomWidth:0.5,borderBottomColor:C.border}}>
        <Text style={{fontSize:26,fontWeight:'900',color:C.text,letterSpacing:-0.5}}>Mes visites</Text>
        <Text style={{fontSize:F.sm,color:C.muted,marginTop:2}}>{visits.length} visite{visits.length>1?'s':''}</Text>
      </SafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg,gap:S.md}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}>
        {visits.length===0&&!loading&&(
          <View style={{alignItems:'center',paddingVertical:60}}>
            <Text style={{fontSize:48,marginBottom:12}}>📅</Text>
            <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Aucune visite</Text>
            <Text style={{fontSize:F.sm,color:C.muted,marginTop:8}}>Vos visites apparaitront ici</Text>
          </View>
        )}
        {visits.map(function(v) {
          var s = STATUS[v.status] || STATUS.PENDING;
          return (
            <View key={v.id} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,elevation:4}}>
              <View style={{flexDirection:'row',alignItems:'flex-start',gap:S.md,marginBottom:S.md}}>
                <View style={{flex:1}}>
                  <Text style={{fontSize:F.base,fontWeight:'800',color:C.text,marginBottom:3}} numberOfLines={1}>{v.listing?v.listing.title:''}</Text>
                  <Text style={{fontSize:F.md,fontWeight:'700',color:C.primary}}>{v.listing?new Intl.NumberFormat('fr-SN').format(v.listing.price)+' F/mois':''}</Text>
                </View>
                <View style={{borderRadius:R.full,paddingHorizontal:10,paddingVertical:4,backgroundColor:s.bg}}>
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:s.color}}>{s.label}</Text>
                </View>
              </View>
              <View style={{height:0.5,backgroundColor:C.border,marginBottom:S.md}} />
              <View style={{gap:S.sm,marginBottom:S.md}}>
                <View style={{flexDirection:'row',alignItems:'center',gap:S.sm}}>
                  <Ionicons name="calendar" size={14} color={C.primary} />
                  <Text style={{fontSize:F.sm,color:C.textMd,fontWeight:'500'}}>{fmt(v.date)}</Text>
                </View>
                {v.owner&&(
                  <View style={{flexDirection:'row',alignItems:'center',gap:S.sm}}>
                    <Ionicons name="person" size={14} color={C.primary} />
                    <Text style={{fontSize:F.sm,color:C.textMd,fontWeight:'500'}}>{v.owner.firstName} {v.owner.lastName}</Text>
                  </View>
                )}
              </View>
              <View style={{flexDirection:'row',gap:S.sm}}>
                <TouchableOpacity style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:9,borderRadius:R.lg,backgroundColor:C.primaryLt}}>
                  <Ionicons name="chatbubble-ellipses" size={15} color={C.primary} />
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary}}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:9,borderRadius:R.lg,backgroundColor:C.primaryLt}}>
                  <Ionicons name="call" size={15} color={C.primary} />
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary}}>Appeler</Text>
                </TouchableOpacity>
                {v.status==='PENDING'&&(
                  <TouchableOpacity onPress={function(){handleCancel(v.id);}} style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:9,borderRadius:R.lg,backgroundColor:'#DC262615'}}>
                    <Ionicons name="close" size={15} color="#DC2626" />
                    <Text style={{fontSize:F.xs,fontWeight:'700',color:'#DC2626'}}>Annuler</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}