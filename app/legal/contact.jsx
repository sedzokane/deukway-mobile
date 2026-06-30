import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

export default function ContactScreen() {
  var subjectS = useState(''); var subject = subjectS[0]; var setSubject = subjectS[1];
  var msgS = useState(''); var msg = msgS[0]; var setMsg = msgS[1];

  function handleSendEmail() {
    var body = encodeURIComponent(msg);
    var sub = encodeURIComponent(subject || 'Support Deukway');
    Linking.openURL('mailto:support@deukway.sn?subject='+sub+'&body='+body);
  }

  function handleWhatsApp() {
    Linking.openURL('https://wa.me/221781731339?text='+encodeURIComponent('Bonjour, j\'ai besoin d\'aide concernant Deukway.'));
  }

  return (
    <View style={{flex:1,backgroundColor:'#F5F5F0'}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}} style={{width:36,height:36,borderRadius:18,backgroundColor:'rgba(255,255,255,0.15)',alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={{fontSize:18,fontWeight:'900',color:'#fff'}}>Nous contacter</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg}}>

        {/* Canaux rapides */}
        <View style={{flexDirection:'row',gap:S.md,marginBottom:S.lg}}>
          <TouchableOpacity onPress={handleWhatsApp} style={{flex:1,backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,alignItems:'center',elevation:2,borderWidth:1,borderColor:'#D1FAE5'}}>
            <View style={{width:48,height:48,borderRadius:24,backgroundColor:'#D1FAE5',alignItems:'center',justifyContent:'center',marginBottom:S.sm}}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text}}>WhatsApp</Text>
            <Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>Réponse rapide</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={function(){Linking.openURL('tel:+221781731339');}} style={{flex:1,backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,alignItems:'center',elevation:2,borderWidth:1,borderColor:'#FEF4E7'}}>
            <View style={{width:48,height:48,borderRadius:24,backgroundColor:C.primaryLt,alignItems:'center',justifyContent:'center',marginBottom:S.sm}}>
              <Ionicons name="call" size={22} color={C.primary} />
            </View>
            <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text}}>Téléphone</Text>
            <Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>9h - 18h</Text>
          </TouchableOpacity>
        </View>

        {/* Formulaire email */}
        <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.lg,elevation:2}}>
          <Text style={{fontSize:F.base,fontWeight:'900',color:C.text,marginBottom:S.md}}>Envoyer un email</Text>

          <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:6}}>Sujet</Text>
          <TextInput
            style={{backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,fontSize:F.sm,color:C.text,borderWidth:1,borderColor:C.border,marginBottom:S.md}}
            placeholder="Ex: Problème de paiement"
            placeholderTextColor={C.gray}
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={{fontSize:F.sm,fontWeight:'700',color:C.text,marginBottom:6}}>Message</Text>
          <TextInput
            style={{backgroundColor:C.bg,borderRadius:R.lg,padding:S.md,fontSize:F.sm,color:C.text,borderWidth:1,borderColor:C.border,minHeight:120,textAlignVertical:'top',marginBottom:S.lg}}
            placeholder="Décrivez votre problème ou votre question..."
            placeholderTextColor={C.gray}
            value={msg}
            onChangeText={setMsg}
            multiline
          />

          <TouchableOpacity onPress={handleSendEmail} disabled={!msg.trim()} activeOpacity={0.88} style={{borderRadius:R.xl,overflow:'hidden',opacity:!msg.trim()?0.5:1}}>
            <LinearGradient colors={['#F0A830','#D4821A','#A85F0E']} start={{x:0,y:0}} end={{x:1,y:0}} style={{paddingVertical:16,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:S.md}}>
              <Ionicons name="mail" size={20} color="#fff" />
              <Text style={{fontSize:F.md,fontWeight:'800',color:'#fff'}}>Envoyer par email</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Infos contact */}
        <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.lg,elevation:2}}>
          <Text style={{fontSize:F.xs,fontWeight:'800',color:C.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:S.md}}>Coordonnées</Text>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md,marginBottom:S.md}}>
            <Ionicons name="mail-outline" size={18} color={C.primary} />
            <Text style={{fontSize:F.sm,color:C.text}}>support@deukway.sn</Text>
          </View>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md,marginBottom:S.md}}>
            <Ionicons name="call-outline" size={18} color={C.primary} />
            <Text style={{fontSize:F.sm,color:C.text}}>+221 78 173 13 39</Text>
          </View>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <Ionicons name="location-outline" size={18} color={C.primary} />
            <Text style={{fontSize:F.sm,color:C.text}}>Dakar, Sénégal</Text>
          </View>
        </View>

        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}