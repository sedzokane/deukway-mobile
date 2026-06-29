import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
var hooks = require('../../src/store/hooks');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

function fmt(d) {
  return new Date(d).toLocaleDateString('fr-SN', { day:'numeric', month:'short', year:'numeric' });
}
function fmtPrice(p) {
  return new Intl.NumberFormat('fr-SN').format(p);
}

var CHANNELS = {
  wave: { label:'Wave', color:'#1E90FF', bg:'#EBF5FF', icon:'💙' },
  orange: { label:'Orange Money', color:'#FF6600', bg:'#FFF0E6', icon:'🧡' },
  free: { label:'Free Money', color:'#CC0000', bg:'#FFE6E6', icon:'❤️' },
  emoney: { label:'E-Money', color:'#059669', bg:'#D1FAE5', icon:'💚' },
  card: { label:'Carte bancaire', color:'#7C3AED', bg:'#EDE9FE', icon:'💳' },
};

var STATUS = {
  PENDING: { label:'En attente', color:'#F59E0B', bg:'#FEF3C7' },
  COMPLETED: { label:'Complété', color:'#059669', bg:'#D1FAE5' },
  FAILED: { label:'Échoué', color:'#DC2626', bg:'#FEE2E2' },
};

export default function PaymentHistory() {
  var paymentsS = useState([]); var payments = paymentsS[0]; var setPayments = paymentsS[1];
  var loadingS = useState(true); var loading = loadingS[0]; var setLoading = loadingS[1];
  var refreshingS = useState(false); var refreshing = refreshingS[0]; var setRefreshing = refreshingS[1];
  var totalS = useState(0); var total = totalS[0]; var setTotal = totalS[1];

  function load(isRefresh) {
    api.get('/payments/history', getToken()).then(function(data) {
      var list = Array.isArray(data) ? data : [];
      setPayments(list);
      var sum = list.filter(function(p){ return p.status === 'COMPLETED'; }).reduce(function(acc, p){ return acc + p.amount; }, 0);
      setTotal(sum);
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }).catch(function() {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    });
  }

  useEffect(function() { load(false); }, []);

  function onRefresh() {
    setRefreshing(true);
    load(true);
  }

  var completed = payments.filter(function(p){ return p.status === 'COMPLETED'; });
  var pending = payments.filter(function(p){ return p.status === 'PENDING'; });

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md,marginBottom:S.lg}}>
            <TouchableOpacity onPress={function(){router.back();}} style={{width:36,height:36,borderRadius:18,backgroundColor:'rgba(255,255,255,0.15)',alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={{fontSize:20,fontWeight:'900',color:'#fff'}}>Historique paiements</Text>
          </View>

          {/* Stats */}
          <View style={{flexDirection:'row',gap:S.md}}>
            <View style={{flex:1,backgroundColor:'rgba(255,255,255,0.12)',borderRadius:R.xl,padding:S.lg}}>
              <Text style={{fontSize:F.xs,color:'rgba(255,255,255,0.7)'}}>Total payé</Text>
              <Text style={{fontSize:F.lg,fontWeight:'900',color:'#F0A830',marginTop:2}}>{fmtPrice(total)} F</Text>
            </View>
            <View style={{flex:1,backgroundColor:'rgba(255,255,255,0.12)',borderRadius:R.xl,padding:S.lg}}>
              <Text style={{fontSize:F.xs,color:'rgba(255,255,255,0.7)'}}>Transactions</Text>
              <Text style={{fontSize:F.lg,fontWeight:'900',color:'#fff',marginTop:2}}>{completed.length}</Text>
            </View>
            {pending.length>0&&(
              <View style={{flex:1,backgroundColor:'rgba(245,158,11,0.2)',borderRadius:R.xl,padding:S.lg,borderWidth:1,borderColor:'rgba(245,158,11,0.4)'}}>
                <Text style={{fontSize:F.xs,color:'rgba(255,255,255,0.7)'}}>En attente</Text>
                <Text style={{fontSize:F.lg,fontWeight:'900',color:'#F59E0B',marginTop:2}}>{pending.length}</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}>

        {loading&&(
          <Text style={{textAlign:'center',color:C.muted,paddingVertical:40}}>Chargement...</Text>
        )}

        {!loading&&payments.length===0&&(
          <View style={{alignItems:'center',paddingVertical:60}}>
            <Text style={{fontSize:48,marginBottom:12}}>💳</Text>
            <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Aucun paiement</Text>
            <Text style={{fontSize:F.sm,color:C.muted,marginTop:8,textAlign:'center'}}>Vos paiements apparaîtront ici après vos transactions</Text>
          </View>
        )}

        {payments.map(function(p) {
          var ch = CHANNELS[p.channel] || { label:p.channel||'—', color:C.primary, bg:C.primaryLt, icon:'💰' };
          var st = STATUS[p.status] || STATUS.PENDING;
          return (
            <View key={p.id} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.md,elevation:3}}>
              <View style={{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',marginBottom:S.md}}>
                <View style={{flexDirection:'row',alignItems:'center',gap:S.md,flex:1}}>
                  <View style={{width:44,height:44,borderRadius:22,backgroundColor:ch.bg,alignItems:'center',justifyContent:'center'}}>
                    <Text style={{fontSize:22}}>{ch.icon}</Text>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={{fontSize:F.base,fontWeight:'800',color:C.text}} numberOfLines={1}>{p.description}</Text>
                    <Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>{ch.label}</Text>
                  </View>
                </View>
                <View style={{alignItems:'flex-end'}}>
                  <Text style={{fontSize:F.base,fontWeight:'900',color:p.status==='COMPLETED'?'#059669':p.status==='FAILED'?'#DC2626':C.primary}}>
                    {p.status==='COMPLETED'?'-':''}{fmtPrice(p.amount)} F
                  </Text>
                  <View style={{backgroundColor:st.bg,borderRadius:R.full,paddingHorizontal:8,paddingVertical:3,marginTop:4}}>
                    <Text style={{fontSize:9,fontWeight:'700',color:st.color}}>{st.label.toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              <View style={{height:0.5,backgroundColor:C.border,marginBottom:S.md}} />

              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <View style={{flexDirection:'row',alignItems:'center',gap:S.sm}}>
                  <Ionicons name="calendar-outline" size={14} color={C.muted} />
                  <Text style={{fontSize:F.xs,color:C.muted}}>{fmt(p.createdAt)}</Text>
                </View>
                {p.token&&(
                  <Text style={{fontSize:F.xs,color:C.gray,fontFamily:'monospace'}}>Réf: {p.token.slice(0,12)}...</Text>
                )}
              </View>

              {p.listing&&(
                <View style={{marginTop:S.sm,flexDirection:'row',alignItems:'center',gap:S.sm}}>
                  <Ionicons name="home-outline" size={14} color={C.muted} />
                  <Text style={{fontSize:F.xs,color:C.muted}} numberOfLines={1}>{p.listing.title}</Text>
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