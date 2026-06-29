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
var useAuth = hooks.useAuth;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var STATUS = {
  PENDING: { label:'En attente', color:'#F59E0B', bg:'#FEF3C7' },
  SIGNED: { label:'Signe', color:'#059669', bg:'#D1FAE5' },
  REJECTED: { label:'Refuse', color:'#DC2626', bg:'#FEE2E2' },
};

function fmt(d) {
  return new Date(d).toLocaleDateString('fr-SN', { day:'numeric', month:'short', year:'numeric' });
}

export default function Contracts() {
  var auth = useAuth();
  var user = auth.user;
  var contractsS = useState([]); var contracts = contractsS[0]; var setContracts = contractsS[1];
  var loadingS = useState(true); var loading = loadingS[0]; var setLoading = loadingS[1];
  var refreshingS = useState(false); var refreshing = refreshingS[0]; var setRefreshing = refreshingS[1];

  function fetchContracts() {
    return api.get('/contracts', getToken()).then(function(data) {
      setContracts(Array.isArray(data) ? data : []);
      setLoading(false);
      setRefreshing(false);
    }).catch(function() {
      setLoading(false);
      setRefreshing(false);
    });
  }

  useEffect(function() { fetchContracts(); }, []);

  function onRefresh() {
    setRefreshing(true);
    fetchContracts();
  }

  var isOwner = user && user.role === 'OWNER';

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.xl,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={{fontSize:22,fontWeight:'900',color:'#fff'}}>Mes contrats</Text>
              <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)',marginTop:2}}>{contracts.length} contrat{contracts.length>1?'s':''}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg,gap:S.md}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}>
        {loading&&<Text style={{textAlign:'center',color:C.muted,paddingVertical:40}}>Chargement...</Text>}
        {!loading&&contracts.length===0&&(
          <View style={{alignItems:'center',paddingVertical:60}}>
            <Text style={{fontSize:48,marginBottom:12}}>📄</Text>
            <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Aucun contrat</Text>
            <Text style={{fontSize:F.sm,color:C.muted,marginTop:4,textAlign:'center'}}>
              {isOwner ? 'Creez un contrat depuis vos visites confirmees' : 'Vos contrats apparaitront ici'}
            </Text>
          </View>
        )}
        {contracts.map(function(c) {
          var s = STATUS[c.status] || STATUS.PENDING;
          var other = isOwner ? c.tenant : c.owner;
          return (
            <TouchableOpacity key={c.id} onPress={function(){router.push('/contracts/'+c.id);}} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,elevation:3}} activeOpacity={0.85}>
              <View style={{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',marginBottom:S.md}}>
                <View style={{flex:1}}>
                  <Text style={{fontSize:F.base,fontWeight:'800',color:C.text,marginBottom:4}} numberOfLines={1}>{c.listing?c.listing.title:'—'}</Text>
                  <Text style={{fontSize:F.xs,color:C.muted}}>{c.listing?c.listing.neighborhood+', '+c.listing.city:''}</Text>
                </View>
                <View style={{paddingHorizontal:10,paddingVertical:4,borderRadius:R.full,backgroundColor:s.bg}}>
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:s.color}}>{s.label}</Text>
                </View>
              </View>

              <View style={{flexDirection:'row',alignItems:'center',gap:S.sm,marginBottom:S.sm}}>
                <Ionicons name="person-outline" size={14} color={C.muted} />
                <Text style={{fontSize:F.xs,color:C.muted}}>{isOwner?'Locataire':'Proprietaire'} : {other?other.firstName+' '+other.lastName:'—'}</Text>
              </View>

              <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                <View style={{flexDirection:'row',alignItems:'center',gap:S.sm}}>
                  <Ionicons name="calendar-outline" size={14} color={C.muted} />
                  <Text style={{fontSize:F.xs,color:C.muted}}>{fmt(c.createdAt)}</Text>
                </View>
                {c.status==='SIGNED'&&(
                  <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <Text style={{fontSize:F.xs,color:'#059669',fontWeight:'700'}}>Signe le {fmt(c.signedAt)}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color={C.gray} />
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}