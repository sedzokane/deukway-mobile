import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var SECTIONS = [
  {
    title: '1. Objet',
    text: "Deukway est une plateforme numérique mettant en relation des propriétaires de biens immobiliers et des locataires au Sénégal. Elle permet la publication d'annonces, la réservation de visites, la signature de contrats de location et le paiement en ligne via les opérateurs de mobile money (Wave, Orange Money, Free Money) et carte bancaire."
  },
  {
    title: '2. Inscription et compte',
    text: "L'utilisateur doit créer un compte avec des informations exactes et à jour. Il est responsable de la confidentialité de ses identifiants. Deukway se réserve le droit de suspendre ou supprimer tout compte fournissant des informations fausses ou trompeuses."
  },
  {
    title: '3. Annonces',
    text: "Les propriétaires s'engagent à publier des annonces exactes, avec des photos réelles du bien et un prix juste. Toute annonce frauduleuse ou trompeuse pourra être supprimée sans préavis. Deukway peut vérifier certaines annonces (badge \"Vérifié\") mais ne garantit pas l'exactitude de toutes les informations publiées par les utilisateurs."
  },
  {
    title: '4. Contrats de location',
    text: "Les contrats générés via Deukway constituent un accord entre le propriétaire et le locataire. Deukway agit comme intermédiaire technique et ne devient pas partie au contrat. La signature électronique sur la plateforme a valeur légale entre les parties. Les utilisateurs sont invités à lire attentivement les clauses avant signature."
  },
  {
    title: '5. Paiements',
    text: "Les paiements (caution, loyer) sont traités via PayDunya, un prestataire de paiement tiers sécurisé. Deukway ne stocke aucune information bancaire sensible. Les transactions sont sécurisées mais Deukway ne peut être tenu responsable des incidents techniques liés aux opérateurs de paiement."
  },
  {
    title: '6. Responsabilités',
    text: "Deukway n'est pas responsable des litiges entre propriétaires et locataires concernant l'état du bien, le respect du contrat ou tout différend financier survenant en dehors de la plateforme. Les utilisateurs sont encouragés à vérifier physiquement les biens avant signature."
  },
  {
    title: '7. Avis et notation',
    text: "Les avis laissés par les locataires doivent être sincères et basés sur une expérience réelle. Tout avis diffamatoire, injurieux ou manifestement faux pourra être supprimé par Deukway."
  },
  {
    title: '8. Données personnelles',
    text: "Deukway collecte et traite les données personnelles nécessaires au fonctionnement du service (identité, contact, photos, géolocalisation des biens) conformément à la réglementation sénégalaise sur la protection des données personnelles. Ces données ne sont jamais vendues à des tiers."
  },
  {
    title: '9. Propriété intellectuelle',
    text: "L'ensemble des éléments de la plateforme Deukway (logo, design, code) est protégé par le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite."
  },
  {
    title: '10. Modification des conditions',
    text: "Deukway se réserve le droit de modifier les présentes conditions générales d'utilisation à tout moment. Les utilisateurs seront informés des modifications substantielles via l'application."
  },
  {
    title: '11. Droit applicable',
    text: "Les présentes conditions sont régies par le droit sénégalais. Tout litige relatif à leur interprétation ou exécution relève de la compétence des tribunaux de Dakar."
  },
];

export default function TermsScreen() {
  return (
    <View style={{flex:1,backgroundColor:'#F5F5F0'}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}} style={{width:36,height:36,borderRadius:18,backgroundColor:'rgba(255,255,255,0.15)',alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={{fontSize:18,fontWeight:'900',color:'#fff'}}>Conditions d'utilisation</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg}}>
        <View style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.xl,marginBottom:S.lg,elevation:2}}>
          <Text style={{fontSize:20,fontWeight:'900',color:'#1B4F3A',marginBottom:4}}>Conditions Générales d'Utilisation</Text>
          <Text style={{fontSize:F.xs,color:C.muted,marginBottom:S.lg}}>Dernière mise à jour : Juin 2026</Text>
          <Text style={{fontSize:F.sm,color:'#444',lineHeight:22}}>
            Bienvenue sur Deukway. En utilisant notre application, vous acceptez les conditions générales d'utilisation suivantes. Veuillez les lire attentivement.
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

        <View style={{backgroundColor:'#F0FDF4',borderRadius:R.xl,padding:S.lg,marginBottom:S.lg,borderWidth:1,borderColor:'#D1FAE5'}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.sm,marginBottom:S.sm}}>
            <Ionicons name="mail-outline" size={18} color="#059669" />
            <Text style={{fontSize:F.sm,fontWeight:'800',color:'#059669'}}>Une question ?</Text>
          </View>
          <Text style={{fontSize:F.sm,color:'#065F46',lineHeight:20}}>
            Pour toute question concernant ces conditions, contactez-nous via la section "Nous contacter" de l'application.
          </Text>
        </View>

        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}