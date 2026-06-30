import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var FAQS = [
  {
    cat: 'Compte',
    items: [
      {q:"Comment créer un compte ?", a:"Cliquez sur \"Créer un compte\" depuis l'écran de connexion, choisissez votre profil (Locataire ou Propriétaire), puis remplissez vos informations. Vous pouvez aussi vous connecter directement avec Google."},
      {q:"J'ai oublié mon mot de passe, que faire ?", a:"Sur l'écran de connexion, cliquez sur \"Mot de passe oublié\". Cette fonctionnalité sera bientôt disponible — en attendant, contactez le support."},
      {q:"Comment changer ma photo de profil ?", a:"Allez dans Profil → Informations personnelles, puis appuyez sur votre photo pour en choisir une nouvelle."},
    ]
  },
  {
    cat: 'Locataires',
    items: [
      {q:"Comment réserver une visite ?", a:"Ouvrez l'annonce qui vous intéresse, appuyez sur \"Réserver une visite\", choisissez un jour et une heure, puis confirmez."},
      {q:"Comment signer un contrat ?", a:"Une fois que le propriétaire vous envoie un contrat, allez dans Profil → Mes contrats, ouvrez le contrat, lisez-le attentivement et appuyez sur \"Signer le contrat\"."},
      {q:"Comment payer ma caution ?", a:"Après signature du contrat, un bouton \"Payer la caution\" apparaît. Vous pouvez payer via Wave, Orange Money, Free Money ou carte bancaire."},
      {q:"Puis-je annuler une visite ?", a:"Contactez directement le propriétaire via la messagerie pour annuler ou reprogrammer une visite."},
    ]
  },
  {
    cat: 'Propriétaires',
    items: [
      {q:"Comment publier une annonce ?", a:"Depuis l'onglet central avec le bouton +, remplissez les informations du bien (titre, photos, prix, équipements) et publiez."},
      {q:"Comment confirmer une visite ?", a:"Dans Mes visites, les demandes en attente apparaissent avec les boutons \"Confirmer\" ou \"Refuser\"."},
      {q:"Comment créer un contrat ?", a:"Une fois une visite confirmée, un bouton \"Créer un contrat\" apparaît sur la visite. Le contrat sera automatiquement envoyé au locataire pour signature."},
      {q:"Comment devenir propriétaire vérifié ?", a:"Le badge \"Vérifié\" est attribué après contrôle de vos documents par l'équipe Deukway. Cette fonctionnalité sera bientôt disponible directement dans l'app."},
    ]
  },
  {
    cat: 'Paiements',
    items: [
      {q:"Quels moyens de paiement sont acceptés ?", a:"Wave, Orange Money, Free Money, E-Money et carte bancaire via notre partenaire sécurisé PayDunya."},
      {q:"Mes informations bancaires sont-elles sécurisées ?", a:"Oui. Deukway ne stocke aucune donnée bancaire sensible. Tous les paiements sont traités directement par PayDunya, prestataire certifié."},
      {q:"Où voir l'historique de mes paiements ?", a:"Allez dans Profil → Paiements pour voir toutes vos transactions."},
    ]
  },
];

function FAQItem({ item }) {
  var openS = useState(false); var open = openS[0]; var setOpen = openS[1];
  return (
    <TouchableOpacity onPress={function(){setOpen(!open);}} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.sm,elevation:2}} activeOpacity={0.8}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <Text style={{fontSize:F.sm,fontWeight:'800',color:C.text,flex:1,paddingRight:S.md}}>{item.q}</Text>
        <Ionicons name={open?'chevron-up':'chevron-down'} size={18} color={C.muted} />
      </View>
      {open&&(
        <Text style={{fontSize:F.sm,color:'#555',lineHeight:20,marginTop:S.md}}>{item.a}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function FAQScreen() {
  return (
    <View style={{flex:1,backgroundColor:'#F5F5F0'}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}} style={{width:36,height:36,borderRadius:18,backgroundColor:'rgba(255,255,255,0.15)',alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={{fontSize:18,fontWeight:'900',color:'#fff'}}>Aide & FAQ</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg}}>
        <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.xl,marginBottom:S.lg,elevation:2,alignItems:'center'}}>
          <View style={{width:56,height:56,borderRadius:28,backgroundColor:C.primaryLt,alignItems:'center',justifyContent:'center',marginBottom:S.md}}>
            <Ionicons name="help-buoy" size={28} color={C.primary} />
          </View>
          <Text style={{fontSize:F.lg,fontWeight:'900',color:C.text,textAlign:'center'}}>Comment pouvons-nous vous aider ?</Text>
          <Text style={{fontSize:F.sm,color:C.muted,textAlign:'center',marginTop:6}}>Retrouvez les réponses aux questions les plus fréquentes</Text>
        </View>

        {FAQS.map(function(section) {
          return (
            <View key={section.cat} style={{marginBottom:S.lg}}>
              <Text style={{fontSize:F.xs,fontWeight:'800',color:C.muted,letterSpacing:1.2,textTransform:'uppercase',marginBottom:S.sm,paddingHorizontal:4}}>{section.cat}</Text>
              {section.items.map(function(item, i) {
                return <FAQItem key={i} item={item} />;
              })}
            </View>
          );
        })}

        <TouchableOpacity onPress={function(){router.push('/legal/contact');}} style={{backgroundColor:C.primaryLt,borderRadius:R.xl,padding:S.lg,flexDirection:'row',alignItems:'center',gap:S.md,marginBottom:S.lg,borderWidth:0.5,borderColor:'rgba(212,130,26,0.2)'}}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={C.primary} />
          <View style={{flex:1}}>
            <Text style={{fontSize:F.sm,fontWeight:'700',color:C.primary}}>Vous ne trouvez pas votre réponse ?</Text>
            <Text style={{fontSize:F.xs,color:C.muted,marginTop:2}}>Contactez notre équipe support</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.primary} />
        </TouchableOpacity>

        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}