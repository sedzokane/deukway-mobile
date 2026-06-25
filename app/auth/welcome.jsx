import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var SLIDES = [
  { photo:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900', tag:'DÉCOUVREZ', title:'Le logement\nidéal à Dakar', sub:'Des milliers d annonces\nvérifiées au Sénégal' },
  { photo:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900', tag:'SÉCURISÉ', title:'Payez en toute\nconfiance', sub:'Wave, Orange Money\net contrats numériques' },
  { photo:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900', tag:'PUBLIEZ', title:'Louez votre bien\nplus vite', sub:'Publiez en 2 minutes\ntouchez des milliers de locataires' },
];

export default function Welcome() {
  var idxS = useState(0); var idx = idxS[0]; var setIdx = idxS[1];
  var fade = useRef(new Animated.Value(1)).current;
  var scale = useRef(new Animated.Value(1)).current;

  useEffect(function() {
    Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue:1.07, duration:5000, useNativeDriver:true }),
      Animated.timing(scale, { toValue:1, duration:5000, useNativeDriver:true }),
    ])).start();
    var timer = setInterval(function() {
      Animated.timing(fade, { toValue:0, duration:400, useNativeDriver:true }).start(function() {
        setIdx(function(i) { return (i+1)%SLIDES.length; });
        Animated.timing(fade, { toValue:1, duration:500, useNativeDriver:true }).start();
      });
    }, 4500);
    return function() { clearInterval(timer); };
  }, []);

  var s = SLIDES[idx];

  return (
    <View style={{ flex:1, backgroundColor:'#000' }}>
      <StatusBar barStyle="light-content" />
      <Animated.Image source={{ uri:s.photo }} style={[StyleSheet.absoluteFillObject, { transform:[{scale:scale}] }]} resizeMode="cover" />
      <LinearGradient colors={['rgba(0,0,0,0.05)','rgba(0,0,0,0.4)','rgba(0,0,0,0.88)','#000']} locations={[0,0.3,0.65,1]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={{ flex:1, paddingHorizontal:S.xl }}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:S.md, paddingTop:S.sm }}>
          <View style={{ width:46, height:46, borderRadius:R.lg, backgroundColor:'rgba(212,130,26,0.2)', borderWidth:1.5, borderColor:C.primary, alignItems:'center', justifyContent:'center' }}>
            <Text style={{ fontSize:22 }}>🏠</Text>
          </View>
          <View>
            <Text style={{ fontSize:F.lg, fontWeight:'900', color:'#fff', letterSpacing:3 }}>DEUKWAY</Text>
            <Text style={{ fontSize:F.xs, color:'rgba(255,255,255,0.5)' }}>Votre maison au Sénégal</Text>
          </View>
        </View>
        <View style={{ flex:1 }} />
        <Animated.View style={{ opacity:fade, marginBottom:S.xl2 }}>
          <View style={{ alignSelf:'flex-start', borderRadius:R.sm, paddingHorizontal:12, paddingVertical:5, marginBottom:S.lg, backgroundColor:C.primary }}>
            <Text style={{ fontSize:F.xs, fontWeight:'800', color:'#fff', letterSpacing:2 }}>{s.tag}</Text>
          </View>
          <Text style={{ fontSize:36, fontWeight:'900', color:'#fff', lineHeight:44, letterSpacing:-0.5, marginBottom:S.md }}>{s.title}</Text>
          <Text style={{ fontSize:F.base, color:'rgba(255,255,255,0.65)', lineHeight:22 }}>{s.sub}</Text>
        </Animated.View>
        <View style={{ flexDirection:'row', gap:6, marginBottom:S.xl }}>
          {SLIDES.map(function(_,i) {
            return <View key={i} style={{ width:i===idx?24:6, height:6, borderRadius:3, backgroundColor:i===idx?C.primary:'rgba(255,255,255,0.25)' }} />;
          })}
        </View>
        <View style={{ flexDirection:'row', backgroundColor:'rgba(255,255,255,0.08)', borderRadius:R.xl, padding:S.lg, marginBottom:S.xl, borderWidth:0.5, borderColor:'rgba(255,255,255,0.1)' }}>
          {[['5 000+','Annonces'],['200+','Quartiers'],['98%','Satisfaits']].map(function(item,i) {
            return (
              <View key={i} style={{ flex:1, alignItems:'center', borderRightWidth:i<2?0.5:0, borderRightColor:'rgba(255,255,255,0.15)' }}>
                <Text style={{ fontSize:F.xl, fontWeight:'900', color:C.primary }}>{item[0]}</Text>
                <Text style={{ fontSize:F.xs, color:'rgba(255,255,255,0.5)', marginTop:2 }}>{item[1]}</Text>
              </View>
            );
          })}
        </View>
        <View style={{ gap:S.sm, marginBottom:S.sm }}>
          <TouchableOpacity onPress={function() { router.push('/auth/register'); }} activeOpacity={0.88}>
            <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{ flexDirection:'row', paddingVertical:17, alignItems:'center', justifyContent:'center', gap:S.sm, borderRadius:R.xl }}>
              <Text style={{ fontSize:F.md, fontWeight:'800', color:'#fff' }}>Commencer maintenant</Text>
              <Text style={{ color:'rgba(255,255,255,0.8)', fontSize:20 }}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={function() { router.push('/auth/login'); }} style={{ paddingVertical:15, alignItems:'center', borderRadius:R.xl, borderWidth:1, borderColor:'rgba(255,255,255,0.2)', backgroundColor:'rgba(255,255,255,0.06)' }} activeOpacity={0.85}>
            <Text style={{ fontSize:F.md, fontWeight:'600', color:'rgba(255,255,255,0.85)' }}>J ai déjà un compte</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}