import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
var hooks = require('../../src/store/hooks');
var authModule = require('../../src/store/auth');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var listingsModule = require('../../src/store/listings');
var chatModule = require('../../src/store/chat');
var useAuth = hooks.useAuth;
var useListings = hooks.useListings;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var MENU = [
  {section:'Mon compte',items:[
    {icon:'person-outline',label:'Informations personnelles',route:'/profile/edit'},
    {icon:'notifications-outline',label:'Notifications',route:'/notifications'},
    {icon:'chatbubbles-outline',label:'Messages',route:'/chat'},
    {icon:'shield-checkmark-outline',label:'Securite',route:null},
  ]},
  {section:'Mes biens',items:[
    {icon:'home-outline',label:'Mes annonces',route:'/owner/listings'},
    {icon:'calendar-outline',label:'Mes visites',route:'/owner/visits'},
    {icon:'document-text-outline',label:'Contrats signes',route:'/contracts'},
    {icon:'card-outline',label:'Paiements recus',route:'/payments/history'},
    {icon:'stats-chart-outline',label:'Statistiques',route:null},
  ]},
  {section:'Support',items:[
    {icon:'help-circle-outline',label:'Aide & FAQ',route:null},
    {icon:'chatbubble-outline',label:'Nous contacter',route:null},
    {icon:'document-text-outline',label:"Conditions d'utilisation",route:'/legal/terms'},
    {icon:'lock-closed-outline',label:'Politique de confidentialité',route:'/legal/privacy'},
    {icon:'star-outline',label:"Noter l'application",route:null},
  ]},
];

export default function Account() {
  var auth = useAuth(); var user = auth.user;
  var store = useListings();
  var visitsS = useState([]); var visits = visitsS[0]; var setVisits = visitsS[1];
  var contractsS = useState([]); var contracts = contractsS[0]; var setContracts = contractsS[1];

  useEffect(function(){
    if (!user) return;
    listingsModule.listingsStore.fetchMyListings(getToken());
    api.get('/visits/owner', getToken()).then(function(data) {
      setVisits(Array.isArray(data) ? data : []);
    }).catch(function(){});
    api.get('/contracts', getToken()).then(function(data) {
      setContracts(Array.isArray(data) ? data : []);
    }).catch(function(){});
  }, [user]);

  var myListings = Array.isArray(store.myListings) ? store.myListings : [];

  function handleMenuPress(item) {
    if (item.route) {
      router.push(item.route);
    } else {
      Toast.show({ type:'info', text1:item.label, text2:'Bientot disponible', visibilityTime:1500 });
    }
  }

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
        <LinearGradient colors={['#0F2E22','#1B4F3A','#2D7A5F']} style={{paddingHorizontal:S.xl,paddingBottom:S.xl2,alignItems:'center'}}>
          <SafeAreaView edges={['top']} style={{alignItems:'center',width:'100%'}}>
            <TouchableOpacity onPress={function(){router.push('/profile/edit');}}>
              {user&&user.avatar
                ? <Image source={{uri:user.avatar}} style={{width:80,height:80,borderRadius:40,borderWidth:3,borderColor:'rgba(255,255,255,0.3)',marginBottom:S.md,marginTop:S.sm}} />
                : <LinearGradient colors={['#2D7A5F','#0F2E22']} style={{width:80,height:80,borderRadius:40,alignItems:'center',justifyContent:'center',borderWidth:3,borderColor:'rgba(255,255,255,0.3)',marginBottom:S.md,marginTop:S.sm}}>
                    <Text style={{fontSize:26,fontWeight:'900',color:'#fff'}}>{user?user.firstName[0]:''}{user?user.lastName[0]:''}</Text>
                  </LinearGradient>
              }
            </TouchableOpacity>
            <Text style={{fontSize:20,fontWeight:'900',color:'#fff'}}>{user?user.firstName:''} {user?user.lastName:''}</Text>
            <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)',marginTop:3}}>{user?user.phone:''}</Text>
            {user&&user.isVerified
              ? <View style={{flexDirection:'row',alignItems:'center',gap:5,marginTop:S.sm,backgroundColor:'rgba(255,255,255,0.1)',borderRadius:R.full,paddingHorizontal:S.md,paddingVertical:5}}>
                  <Ionicons name="shield-checkmark" size={13} color={C.gold} />
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:C.gold}}>Proprietaire verifie</Text>
                </View>
              : <TouchableOpacity style={{flexDirection:'row',alignItems:'center',gap:5,marginTop:S.sm,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:R.full,paddingHorizontal:S.md,paddingVertical:5,borderWidth:0.5,borderColor:'rgba(255,255,255,0.2)'}}>
                  <Ionicons name="shield-outline" size={13} color='rgba(255,255,255,0.6)' />
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:'rgba(255,255,255,0.6)'}}>Faire verifier mon compte</Text>
                </TouchableOpacity>
            }
          </SafeAreaView>
        </LinearGradient>

        <View style={{flexDirection:'row',backgroundColor:'#fff',borderBottomWidth:0.5,borderBottomColor:C.border}}>
          {[
            {val:String(myListings.length),label:'Annonces',route:'/owner/listings'},
            {val:String(visits.length),label:'Visites',route:'/owner/visits'},
            {val:String(contracts.length),label:'Contrats',route:'/contracts'},
          ].map(function(item,i) {
            return (
              <TouchableOpacity key={i} onPress={function(){ if(item.route) router.push(item.route); }} style={{flex:1,alignItems:'center',paddingVertical:S.lg,borderRightWidth:i<2?0.5:0,borderRightColor:C.border}} activeOpacity={item.route?0.7:1}>
                <Text style={{fontSize:20,fontWeight:'900',color:C.owner}}>{item.val}</Text>
                <Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{padding:S.lg,gap:S.lg}}>
          {MENU.map(function(section) {
            return (
              <View key={section.section}>
                <Text style={{fontSize:F.xs,fontWeight:'800',color:C.muted,letterSpacing:1.2,textTransform:'uppercase',marginBottom:S.sm}}>{section.section}</Text>
                <View style={{backgroundColor:'#fff',borderRadius:R.xl,overflow:'hidden',elevation:3}}>
                  {section.items.map(function(item,i) {
                    return (
                      <TouchableOpacity key={item.label} onPress={function(){handleMenuPress(item);}} style={{flexDirection:'row',alignItems:'center',gap:S.md,padding:S.lg,borderBottomWidth:i<section.items.length-1?0.5:0,borderBottomColor:C.border}} activeOpacity={0.7}>
                        <View style={{width:36,height:36,borderRadius:18,backgroundColor:item.route?C.ownerLt:'#F5F5F5',alignItems:'center',justifyContent:'center'}}>
                          <Ionicons name={item.icon} size={18} color={item.route?C.owner:C.gray} />
                        </View>
                        <Text style={{flex:1,fontSize:F.base,fontWeight:'500',color:item.route?C.text:C.muted}}>{item.label}</Text>
                        {item.route
                          ? <Ionicons name="chevron-forward" size={16} color={C.gray} />
                          : <View style={{backgroundColor:'#F0F0F0',borderRadius:R.full,paddingHorizontal:8,paddingVertical:3}}>
                              <Text style={{fontSize:9,fontWeight:'700',color:C.muted}}>BIENTOT</Text>
                            </View>
                        }
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <TouchableOpacity style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:S.md,backgroundColor:'#FFF0F0',borderRadius:R.xl,padding:S.lg,borderWidth:0.5,borderColor:'#DC262633'}} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={{fontSize:F.base,fontWeight:'700',color:'#DC2626'}}>Se deconnecter</Text>
          </TouchableOpacity>
          <Text style={{textAlign:'center',fontSize:F.xs,color:C.gray,marginTop:S.md}}>Deukway v1.0.0</Text>
          <View style={{height:20}} />
        </View>
      </ScrollView>
    </View>
  );
}