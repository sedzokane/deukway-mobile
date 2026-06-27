import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
var t = require('../../src/theme');
var C=t.C; var F=t.F;

export default function TenantLayout() {
  return (
    <Tabs screenOptions={{
      headerShown:false,
      tabBarActiveTintColor:C.primary,
      tabBarInactiveTintColor:'#AAAAAA',
      tabBarStyle:{height:70,backgroundColor:'#fff',borderTopWidth:0.5,borderTopColor:'#EBEBEB',paddingBottom:8,elevation:12},
      tabBarLabelStyle:{fontSize:10,fontWeight:'700'},
    }}>
      <Tabs.Screen name="home" options={{title:'Accueil',tabBarIcon:function(p){return <Ionicons name={p.focused?'home':'home-outline'} size={22} color={p.color} />;} }} />
      <Tabs.Screen name="search" options={{title:'Explorer',tabBarIcon:function(p){return <Ionicons name={p.focused?'search':'search-outline'} size={22} color={p.color} />;} }} />
      <Tabs.Screen name="publish" options={{href:null}} />
      <Tabs.Screen name="messages" options={{title:'Messages',tabBarIcon:function(p){return <Ionicons name={p.focused?'chatbubbles':'chatbubbles-outline'} size={22} color={p.color} />;} }} />
      <Tabs.Screen name="visits" options={{title:'Visites',tabBarIcon:function(p){return <Ionicons name={p.focused?'calendar':'calendar-outline'} size={22} color={p.color} />;} }} />
      <Tabs.Screen name="profile" options={{title:'Profil',tabBarIcon:function(p){return <Ionicons name={p.focused?'person':'person-outline'} size={22} color={p.color} />;} }} />
    </Tabs>
  );
}