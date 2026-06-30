import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
var hooks = require('../../src/store/hooks');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var listingsModule = require('../../src/store/listings');
var useListings = hooks.useListings;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

function fmt(p) { return new Intl.NumberFormat('fr-SN').format(p); }

export default function StatsScreen() {
  var store = useListings();
  var visitsS = useState([]); var visits = visitsS[0]; var setVisits = visitsS[1];
  var contractsS = useState([]); var contracts = contractsS[0]; var setContracts = contractsS[1];
  var paymentsS = useState([]); var payments = paymentsS[0]; var setPayments = paymentsS[1];
  var loadingS = useState(true); var loading = loadingS[0]; var setLoading = loadingS[1];

  useEffect(function() {
    listingsModule.listingsStore.fetchMyListings(getToken());
    Promise.all([
      api.get('/visits/owner', getToken()),
      api.get('/contracts', getToken()),
      api.get('/payments/history', getToken()),
    ]).then(function(results) {
      setVisits(Array.isArray(results[0]) ? results[0] : []);
      setContracts(Array.isArray(results[1]) ? results[1] : []);
      setPayments(Array.isArray(results[2]) ? results[2] : []);
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }, []);

  var myListings = Array.isArray(store.myListings) ? store.myListings : [];
  var totalViews = myListings.reduce(function(sum, l) { return sum + (l.viewCount || 0); }, 0);
  var totalFavorites = myListings.reduce(function(sum, l) { return sum + (l._count ? l._count.favorites || 0 : 0); }, 0);
  var activeListings = myListings.filter(function(l) { return l.isActive; }).length;
  var verifiedListings = myListings.filter(function(l) { return l.isVerified; }).length;

  var confirmedVisits = visits.filter(function(v) { return v.status === 'CONFIRMED'; }).length;
  var pendingVisits = visits.filter(function(v) { return v.status === 'PENDING'; }).length;

  var signedContracts = contracts.filter(function(c) { return c.status === 'SIGNED'; }).length;
  var pendingContracts = contracts.filter(function(c) { return c.status === 'PENDING'; }).length;

  var completedPayments = payments.filter(function(p) { return p.status === 'COMPLETED'; });
  var totalRevenue = completedPayments.reduce(function(sum, p) { return sum + p.amount; }, 0);

  var bestListing = myListings.slice().sort(function(a, b) { return (b.viewCount||0) - (a.viewCount||0); })[0];

  function StatCard({ icon, label, value, color, bg }) {
    return (
      <View style={{flex:1,backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,elevation:3}}>
        <View style={{width:40,height:40,borderRadius:20,backgroundColor:bg,alignItems:'center',justifyContent:'center',marginBottom:S.sm}}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={{fontSize:22,fontWeight:'900',color:C.text}}>{value}</Text>
        <Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#0F2E22','#1B4F3A','#2D7A5F']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}} style={{width:36,height:36,borderRadius:18,backgroundColor:'rgba(255,255,255,0.15)',alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={{fontSize:20,fontWeight:'900',color:'#fff'}}>Statistiques</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg}}>
        {loading&&(
          <Text style={{textAlign:'center',color:C.muted,paddingVertical:40}}>Chargement...</Text>
        )}

        {!loading&&(
          <>
            {/* Revenus */}
            <LinearGradient colors={['#1B4F3A','#2D7A5F']} style={{borderRadius:R.xl2,padding:S.xl,marginBottom:S.lg}}>
              <Text style={{fontSize:F.xs,color:'rgba(255,255,255,0.7)',marginBottom:6}}>REVENUS TOTAUX</Text>
              <Text style={{fontSize:32,fontWeight:'900',color:'#fff'}}>{fmt(totalRevenue)} <Text style={{fontSize:F.lg,fontWeight:'400'}}>F</Text></Text>
              <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)',marginTop:6}}>{completedPayments.length} paiement{completedPayments.length!==1?'s':''} reçu{completedPayments.length!==1?'s':''}</Text>
            </LinearGradient>

            {/* Annonces */}
            <Text style={{fontSize:F.sm,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.md}}>Annonces</Text>
            <View style={{flexDirection:'row',gap:S.md,marginBottom:S.lg}}>
              <StatCard icon="home" label="Annonces actives" value={activeListings} color="#1B4F3A" bg="#D1FAE5" />
              <StatCard icon="eye" label="Vues totales" value={totalViews} color="#2563EB" bg="#DBEAFE" />
            </View>
            <View style={{flexDirection:'row',gap:S.md,marginBottom:S.lg}}>
              <StatCard icon="shield-checkmark" label="Annonces vérifiées" value={verifiedListings} color="#D97706" bg="#FEF3C7" />
              <StatCard icon="heart" label="Favoris reçus" value={totalFavorites} color="#DC2626" bg="#FEE2E2" />
            </View>

            {/* Visites */}
            <Text style={{fontSize:F.sm,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.md}}>Visites</Text>
            <View style={{flexDirection:'row',gap:S.md,marginBottom:S.lg}}>
              <StatCard icon="checkmark-circle" label="Confirmées" value={confirmedVisits} color="#059669" bg="#D1FAE5" />
              <StatCard icon="time" label="En attente" value={pendingVisits} color="#F59E0B" bg="#FEF3C7" />
            </View>

            {/* Contrats */}
            <Text style={{fontSize:F.sm,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.md}}>Contrats</Text>
            <View style={{flexDirection:'row',gap:S.md,marginBottom:S.lg}}>
              <StatCard icon="document-text" label="Signés" value={signedContracts} color="#7C3AED" bg="#EDE9FE" />
              <StatCard icon="hourglass" label="En attente" value={pendingContracts} color="#F59E0B" bg="#FEF3C7" />
            </View>

            {/* Meilleure annonce */}
            {bestListing&&(
              <View>
                <Text style={{fontSize:F.sm,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.md}}>Annonce la plus vue</Text>
                <TouchableOpacity onPress={function(){router.push('/listing/'+bestListing.id);}} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,flexDirection:'row',alignItems:'center',gap:S.md,elevation:3,marginBottom:S.lg}}>
                  <View style={{width:48,height:48,borderRadius:24,backgroundColor:'#D1FAE5',alignItems:'center',justifyContent:'center'}}>
                    <Ionicons name="trophy" size={22} color="#1B4F3A" />
                  </View>
                  <View style={{flex:1}}>
                    <Text style={{fontSize:F.sm,fontWeight:'800',color:C.text}} numberOfLines={1}>{bestListing.title}</Text>
                    <View style={{flexDirection:'row',alignItems:'center',gap:4,marginTop:2}}>
                      <Ionicons name="eye-outline" size={12} color={C.muted} />
                      <Text style={{fontSize:F.xs,color:C.muted}}>{bestListing.viewCount || 0} vues</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.muted} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}