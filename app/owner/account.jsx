import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
var hooks = require('../../src/store/hooks');
var authModule = require('../../src/store/auth');
var useAuth = hooks.useAuth;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var MENU = [
  {section:'Mon compte',items:[{icon:'person-outline',label:'Informations personnelles'},{icon:'notifications-outline',label:'Notifications'},{icon:'shield-checkmark-outline',label:'Securite'}]},
  {section:'Mes biens',items:[{icon:'document-text-outline',label:'Contrats signes'},{icon:'card-outline',label:'Paiements recus'},{icon:'stats-chart-outline',label:'Statistiques'}]},
  {section:'Support',items:[{icon:'help-circle-outline',label:'Aide & FAQ'},{icon:'chatbubble-outline',label:'Nous contacter'},{icon:'star-outline',label:'Noter l application'}]},
];

export default function Account() {
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

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0F2E22','#1B4F3A','#2D7A5F']} style={{paddingHorizontal:S.xl,paddingBottom:S.xl2,alignItems:'center'}}>
          <SafeAreaView edges={['top']} style={{alignItems:'center',width:'100%'}}>
            {user&&user.avatar
              ? <Image source={{uri:user.avatar}} style={{width:80,height:80,borderRadius:40,borderWidth:3,borderColor:'rgba(255,255,255,0.3)',marginBottom:S.md,marginTop:S.sm}} />
              : <LinearGradient colors={['#2D7A5F','#0F2E22']} style={{width:80,height:80,borderRadius:40,alignItems:'center',justifyContent:'center',borderWidth:3,borderColor:'rgba(255,255,255,0.3)',marginBottom:S.md,marginTop:S.sm}}>
                  <Text style={{fontSize:26,fontWeight:'900',color:'#fff'}}>{user?user.firstName[0]:''}{user?user.lastName[0]:''}</Text>
                </LinearGradient>
            }
            <Text style={{fontSize:20,fontWeight:'900',color:'#fff'}}>{user?user.firstName:''} {user?user.lastName:''}</Text>
            <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)',marginTop:3}}>{user?user.phone:''}</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:5,marginTop:S.sm,backgroundColor:'rgba(255,255,255,0.1)',borderRadius:R.full,paddingHorizontal:S.md,paddingVertical:5}}>
              <Ionicons name="key" size={13} color={C.gold} />
              <Text style={{fontSize:F.xs,fontWeight:'700',color:C.gold}}>Proprietaire verifie</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={{flexDirection:'row',backgroundColor:'#fff',borderBottomWidth:0.5,borderBottomColor:C.border}}>
          {[['3','Annonces'],['5','Visites'],['0','Contrats']].map(function(item,i) {
            return (
              <View key={i} style={{flex:1,alignItems:'center',paddingVertical:S.lg,borderRightWidth:i<2?0.5:0,borderRightColor:C.border}}>
                <Text style={{fontSize:20,fontWeight:'900',color:C.owner}}>{item[0]}</Text>
                <Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>{item[1]}</Text>
              </View>
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
                      <TouchableOpacity key={item.label} style={{flexDirection:'row',alignItems:'center',gap:S.md,padding:S.lg,borderBottomWidth:i<section.items.length-1?0.5:0,borderBottomColor:C.border}} activeOpacity={0.7}>
                        <View style={{width:36,height:36,borderRadius:18,backgroundColor:C.ownerLt,alignItems:'center',justifyContent:'center'}}>
                          <Ionicons name={item.icon} size={18} color={C.owner} />
                        </View>
                        <Text style={{flex:1,fontSize:F.base,fontWeight:'500',color:C.text}}>{item.label}</Text>
                        <Ionicons name="chevron-forward" size={16} color={C.gray} />
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