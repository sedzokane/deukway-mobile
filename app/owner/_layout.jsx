import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
var t = require('../../src/theme');
var C=t.C; var F=t.F;

function FabBtn() {
  return (
    <View style={{marginTop:-20}}>
      <LinearGradient colors={['#2D7A5F','#1B4F3A','#0F2E22']} style={{width:56,height:56,borderRadius:28,alignItems:'center',justifyContent:'center',borderWidth:3,borderColor:'#fff',elevation:10}} start={{x:0,y:0}} end={{x:1,y:1}}>
        <Ionicons name="add" size={28} color="#fff" />
      </LinearGradient>
    </View>
  );
}

export default function OwnerLayout() {
  return (
    <Tabs screenOptions={{
      headerShown:false,
      tabBarActiveTintColor:C.owner,
      tabBarInactiveTintColor:'#AAAAAA',
      tabBarStyle:{height:70,backgroundColor:'#fff',borderTopWidth:0.5,borderTopColor:'#EBEBEB',paddingBottom:8,elevation:12},
      tabBarLabelStyle:{fontSize:11,fontWeight:'700'},
    }}>
      <Tabs.Screen name="dashboard" options={{title:'Dashboard',tabBarIcon:function(p){return <Ionicons name={p.focused?'grid':'grid-outline'} size={22} color={p.color} />;} }} />
      <Tabs.Screen name="listings" options={{title:'Mes biens',tabBarIcon:function(p){return <Ionicons name={p.focused?'home':'home-outline'} size={22} color={p.color} />;} }} />
      <Tabs.Screen name="publish" options={{title:'',tabBarButton:function(props){return <View {...props} style={{flex:1,alignItems:'center',justifyContent:'center'}}><FabBtn /></View>;},tabBarIcon:function(){return null;}}} />
      <Tabs.Screen name="visits" options={{title:'Visites',tabBarIcon:function(p){return <Ionicons name={p.focused?'calendar':'calendar-outline'} size={22} color={p.color} />;} }} />
      <Tabs.Screen name="account" options={{title:'Compte',tabBarIcon:function(p){return <Ionicons name={p.focused?'person':'person-outline'} size={22} color={p.color} />;} }} />
    </Tabs>
  );
}