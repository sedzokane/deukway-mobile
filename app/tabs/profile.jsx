import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
var hooks = require('../../src/store/hooks');
var authModule = require('../../src/store/auth');
var useAuth = hooks.useAuth;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var MENU = [
  {section:'Mon compte',items:[
    {icon:'person-outline',label:'Informations personnelles',route:'/profile/edit'},
    {icon:'notifications-outline',label:'Notifications',route:'/notifications'},
    {icon:'shield-checkmark-outline',label:'Securite',route:null},
  ]},
  {section:'Activite',items:[
    {icon:'heart-outline',label:'Mes favoris',route:'/favorites'},
    {icon:'calendar-outline',label:'Mes visites',route:'/tabs/visits'},
    {icon:'document-text-outline',label:'Mes contrats',route:'/contracts'},
    {icon:'card-outline',label:'Paiements',route:'/payments/history'},
  ]},
  {section:'Support',items:[
    {icon:'help-circle-outline',label:'Aide & FAQ',route:null},
    {icon:'chatbubble-outline',label:'Nous contacter',route:null},
    {icon:'document-text-outline',label:"Conditions d'utilisation",route:'/legal/terms'},
    {icon:'lock-closed-outline',label:'Politique de confidentialité',route:'/legal/privacy'},
    {icon:'star-outline',label:"Noter l'application",route:null},
  ]},
];

function Avatar({ uri, size, colors, initials }) {
  var s = size || 80;
  var r = s / 2;
  if (uri && uri.startsWith('http')) {
    return <Image source={{uri:uri}} style={{width:s,height:s,borderRadius:r,borderWidth:3,borderColor:'rgba(255,255,255,0.3)',marginBottom:8,marginTop:4}} />;
  }
  return (
    <LinearGradient colors={colors||['#F0A830','#D4821A']} style={{width:s,height:s,borderRadius:r,alignItems:'center',justifyContent:'center',borderWidth:3,borderColor:'rgba(255,255,255,0.3)',marginBottom:8,marginTop:4}}>
      <Text style={{fontSize:s*0.32,fontWeight:'900',color:'#fff'}}>{initials}</Text>
    </LinearGradient>
  );
}

export default function Profile() {
  var auth = useAuth();
  var user = auth.user;

  function handleLogout() {
    Toast.show({
      type: 'error',
      text1: 'Deconnexion',
      text2: 'Vous avez ete deconnecte avec succes',
      visibilityTime: 2000,
      onHide: function() { authModule.authStore.logout(); }
    });
  }

  function handleMenuPress(item) {
    if (item.route) {
      router.push(item.route);
    } else {
      Toast.show({ type:'info', text1:item.label, text2:'Bientot disponible', visibilityTime:1500 });
    }
  }

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingHorizontal:S.xl,paddingBottom:S.xl2,alignItems:'center'}}>
          <SafeAreaView edges={['top']} style={{alignItems:'center',width:'100%'}}>
            <TouchableOpacity onPress={function(){router.push('/profile/edit');}}>
              <Avatar uri={user?user.avatar:null} size={80} initials={(user?user.firstName[0]:'')+(user?user.lastName[0]:'')} />
            </TouchableOpacity>
            <Text style={{fontSize:20,fontWeight:'900',color:'#fff'}}>{user?user.firstName:''} {user?user.lastName:''}</Text>
            <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)',marginTop:3}}>{user?user.phone:''}</Text>
            {user&&user.isVerified&&(
              <View style={{flexDirection:'row',alignItems:'center',gap:5,marginTop:S.sm,backgroundColor:'rgba(255,255,255,0.1)',borderRadius:R.full,paddingHorizontal:S.md,paddingVertical:5}}>
                <Ionicons name="shield-checkmark" size={13} color={C.gold} />
                <Text style={{fontSize:F.xs,fontWeight:'700',color:C.gold}}>Compte verifie</Text>
              </View>
            )}
          </SafeAreaView>
        </LinearGradient>

        <View style={{flexDirection:'row',backgroundColor:'#fff',borderBottomWidth:0.5,borderBottomColor:C.border}}>
          {[
            {val:'❤️',label:'Favoris',route:'/favorites'},
            {val:'📅',label:'Visites',route:'/tabs/visits'},
            {val:'💬',label:'Messages',route:'/chat'},
          ].map(function(item,i) {
            return (
              <TouchableOpacity key={i} onPress={function(){router.push(item.route);}} style={{flex:1,alignItems:'center',paddingVertical:S.lg,borderRightWidth:i<2?0.5:0,borderRightColor:C.border}} activeOpacity={0.7}>
                <Text style={{fontSize:20}}>{item.val}</Text>
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
                        <View style={{width:36,height:36,borderRadius:18,backgroundColor:item.route?C.primaryLt:'#F5F5F5',alignItems:'center',justifyContent:'center'}}>
                          <Ionicons name={item.icon} size={18} color={item.route?C.primary:C.gray} />
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