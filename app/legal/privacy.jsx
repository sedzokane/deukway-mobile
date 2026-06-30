import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var SECTIONS = [
  {
    title: 'Données collectées',
    text: "Nous collectons : nom, prénom, numéro de téléphone, email, photo de profil, localisation des biens publiés, historique de messages, visites et contrats, informations de paiement (sans stocker les données bancaires sensibles, traitées directement par PayDunya)."
  },
  {
    title: 'Utilisation des données',
    text: "Vos données sont utilisées pour : la mise en relation propriétaire/locataire, l'envoi de notifications, la génération de contrats, le traitement des paiements, l'amélioration du service. Nous n'utilisons jamais vos données à des fins publicitaires tierces."
  },
  {
    title: 'Partage des données',
    text: "Vos coordonnées sont partagées avec votre interlocuteur direct (propriétaire ou locataire) dans le cadre d'une mise en relation. Nous ne vendons ni ne louons vos données personnelles à des tiers."
  },
  {
    title: 'Sécurité',
    text: "Les mots de passe sont chiffrés. Les paiements transitent via PayDunya, prestataire certifié. Les communications sont sécurisées (HTTPS)."
  },
  {
    title: 'Vos droits',
    text: "Vous pouvez à tout moment demander l'accès, la rectification ou la suppression de vos données personnelles en nous contactant via l'application."
  },
  {
    title: 'Conservation des données',
    text: "Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données personnelles sont effacées sous 30 jours, sauf obligation légale de conservation."
  },
];

export default function PrivacyScreen() {
  return (
    <View style={{flex:1,backgroundColor:'#F5F5F0'}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}} style={{width:36,height:36,borderRadius:18,backgroundColor:'rgba(255,255,255,0.15)',alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={{fontSize:18,fontWeight:'900',color:'#fff'}}>Politique de confidentialité</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg}}>
        <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.xl,marginBottom:S.lg,elevation:2}}>
          <Text style={{fontSize:20,fontWeight:'900',color:'#1B4F3A',marginBottom:4}}>Politique de Confidentialité</Text>
          <Text style={{fontSize:F.xs,color:C.muted,marginBottom:S.lg}}>Dernière mise à jour : Juin 2026</Text>
          <Text style={{fontSize:F.sm,color:'#444',lineHeight:22}}>
            Chez Deukway, la protection de vos données personnelles est une priorité. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
          </Text>
        </View>

        {SECTIONS.map(function(s, i) {
          return (
            <View key={i} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,marginBottom:S.md,elevation:2}}>
              <Text style={{fontSize:F.base,fontWeight:'900',color:'#1B4F3A',marginBottom:S.sm}}>{s.title}</Text>
              <Text style={{fontSize:F.sm,color:'#555',lineHeight:21}}>{s.text}</Text>
            </View>
          );
        })}

        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}