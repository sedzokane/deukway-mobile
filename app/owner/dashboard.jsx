import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
var hooks = require('../../src/store/hooks');
var listingsModule = require('../../src/store/listings');
var useAuth = hooks.useAuth;
var useListings = hooks.useListings;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;
var W = Dimensions.get('window').width;

var STATS = [
  {icon:'home',label:'Annonces',val:'3',color:'#D4821A',bg:'#FEF4E7'},
  {icon:'calendar',label:'Visites',val:'5',color:'#1A56DB',bg:'#EBF3FF'},
  {icon:'chatbubble',label:'Messages',val:'12',color:'#1A2E4A',bg:'#EBF0F7'},
  {icon:'eye',label:'Vues',val:'432',color:'#C9963A',bg:'#FBF4DF'},
];
var QUICK = [
  {icon:'add-circle',label:'Publier',sub:'Nouvelle annonce',grad:['#243D61','#1A2E4A']},
  {icon:'stats-chart',label:'Stats',sub:'Performance',grad:['#0A8754','#065C39']},
  {icon:'calendar',label:'Visites',sub:'Calendrier',grad:['#C87A0A','#8F5608']},
  {icon:'chatbubbles',label:'Messages',sub:'Inbox',grad:['#1A56DB','#1040AA']},
];

export default function Dashboard() {
  var auth = useAuth(); var user = auth.user;
  var store = useListings(); var items = store.items;
  useEffect(function(){listingsModule.listingsStore.fetch();}, []);

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0F2E22','#1B4F3A','#2D7A5F']} style={{paddingHorizontal:S.xl,paddingBottom:S.xl}}>
          <SafeAreaView edges={['top']}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:S.lg}}>
              <View>
                <View style={{flexDirection:'row',alignItems:'center',alignSelf:'flex-start',backgroundColor:'rgba(255,255,255,0.12)',borderRadius:R.sm,paddingHorizontal:10,paddingVertical:5,marginBottom:S.sm,borderWidth:0.5,borderColor:'rgba(255,255,255,0.2)'}}>
                  <Ionicons name="key" size={11} color="rgba(255,255,255,0.8)" />
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:'rgba(255,255,255,0.8)',letterSpacing:1.5,marginLeft:5}}>PROPRIÉTAIRE</Text>
                </View>
                <Text style={{fontSize:22,fontWeight:'900',color:'#fff',lineHeight:30}}>Bonjour,{'\n'}{user?user.firstName:''} 👋</Text>
              </View>
              <TouchableOpacity style={{width:42,height:42,borderRadius:21,backgroundColor:'rgba(255,255,255,0.12)',alignItems:'center',justifyContent:'center'}} onPress={function(){router.push('/notifications');}}>
                <Ionicons name="notifications" size={22} color="#fff" />
                <View style={{position:'absolute',top:8,right:8,width:9,height:9,borderRadius:5,backgroundColor:C.primary,borderWidth:1.5,borderColor:'rgba(255,255,255,0.8)'}} />
              </TouchableOpacity>
            </View>
            <View style={{flexDirection:'row',gap:S.sm}}>
              {QUICK.map(function(q,i){
                return (
                  <TouchableOpacity key={i} style={{flex:1,borderRadius:R.xl,overflow:'hidden'}} activeOpacity={0.85}>
                    <LinearGradient colors={q.grad} style={{padding:S.md,minHeight:88,justifyContent:'flex-end',gap:2}}>
                      <Ionicons name={q.icon} size={22} color="#fff" />
                      <Text style={{fontSize:F.base,fontWeight:'800',color:'#fff'}}>{q.label}</Text>
                      <Text style={{fontSize:F.xs,color:'rgba(255,255,255,0.65)'}}>{q.sub}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={{paddingHorizontal:S.lg,paddingTop:S.xl}}>
          <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text,letterSpacing:-0.2,marginBottom:S.md}}>Tableau de bord</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:S.sm,marginBottom:S.xl}}>
            {STATS.map(function(s,i){
              return (
                <View key={i} style={{width:(W-S.lg*2-S.sm)/2,borderRadius:R.xl,padding:S.lg,gap:4,backgroundColor:s.bg}}>
                  <Ionicons name={s.icon} size={26} color={s.color} />
                  <Text style={{fontSize:26,fontWeight:'900',color:s.color}}>{s.val}</Text>
                  <Text style={{fontSize:F.xs,color:C.muted}}>{s.label}</Text>
                </View>
              );
            })}
          </View>

          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:S.md}}>
            <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Mes annonces</Text>
            <TouchableOpacity><Text style={{fontSize:F.sm,fontWeight:'700',color:C.owner}}>Gérer →</Text></TouchableOpacity>
          </View>

          {items.slice(0,3).map(function(l){
            return (
              <TouchableOpacity key={l.id} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.md,marginBottom:S.md,flexDirection:'row',alignItems:'center',justifyContent:'space-between',elevation:3}} onPress={function(){router.push('/listing/'+l.id);}} activeOpacity={0.88}>
                <View style={{flex:1,marginRight:S.md}}>
                  <Text style={{fontSize:F.base,fontWeight:'800',color:C.text}} numberOfLines={1}>{l.title}</Text>
                  <View style={{flexDirection:'row',alignItems:'center',gap:4,marginTop:3}}>
                    <Ionicons name="location" size={11} color={C.muted} />
                    <Text style={{fontSize:F.xs,color:C.muted}}>{l.neighborhood}</Text>
                  </View>
                  <Text style={{fontSize:F.md,fontWeight:'700',color:C.primary,marginTop:4}}>{new Intl.NumberFormat('fr-SN').format(l.price)} F/mois</Text>
                </View>
                <View style={{alignItems:'flex-end',gap:6}}>
                  <View style={{borderRadius:R.full,paddingHorizontal:10,paddingVertical:4,backgroundColor:'#05996922'}}>
                    <Text style={{fontSize:F.xs,fontWeight:'700',color:'#059669'}}>Active</Text>
                  </View>
                  <View style={{flexDirection:'row',alignItems:'center',gap:3}}>
                    <Ionicons name="eye" size={12} color={C.gray} />
                    <Text style={{fontSize:F.xs,color:C.gray}}>{l.viewCount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={{flexDirection:'row',alignItems:'flex-start',gap:S.md,backgroundColor:C.ownerLt,borderRadius:R.xl,padding:S.lg,marginTop:S.sm,borderWidth:0.5,borderColor:C.owner+'22'}}>
            <Ionicons name="bulb" size={22} color={C.owner} />
            <View style={{flex:1}}>
              <Text style={{fontSize:F.base,fontWeight:'700',color:C.owner,marginBottom:4}}>Conseil du jour</Text>
              <Text style={{fontSize:F.sm,color:C.textMd,lineHeight:20}}>Les annonces avec 5+ photos reçoivent 3x plus de demandes !</Text>
            </View>
          </View>
          <View style={{height:30}} />
        </View>
      </ScrollView>
    </View>
  );
}