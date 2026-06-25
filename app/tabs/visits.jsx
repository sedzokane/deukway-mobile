import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var VISITS = [
  {id:'v1',title:'Studio meublé - Plateau',date:'Sam 28 Juin',time:'10h00',status:'confirmed',owner:'Amadou Koné',price:'120 000 F/mois'},
  {id:'v2',title:'Appartement F3 - Mermoz',date:'Dim 29 Juin',time:'14h30',status:'pending',owner:'Ibrahima Sow',price:'280 000 F/mois'},
  {id:'v3',title:'Studio - Almadies',date:'Lun 30 Juin',time:'11h00',status:'pending',owner:'Ousmane Diop',price:'180 000 F/mois'},
];

var STATUS = {
  confirmed:{label:'Confirmée ✓',color:'#059669',bg:'#05966922'},
  pending:{label:'En attente',color:'#D4821A',bg:'#FEF4E7'},
};

export default function Visits() {
  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <SafeAreaView edges={['top']} style={{backgroundColor:'#fff',paddingHorizontal:S.lg,paddingBottom:S.md,borderBottomWidth:0.5,borderBottomColor:C.border}}>
        <Text style={{fontSize:26,fontWeight:'900',color:C.text,letterSpacing:-0.5}}>Mes visites</Text>
        <Text style={{fontSize:F.sm,color:C.muted,marginTop:2}}>{VISITS.length} visites planifiées</Text>
      </SafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg,gap:S.md}}>
        {VISITS.map(function(v) {
          var s = STATUS[v.status];
          return (
            <View key={v.id} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,elevation:4}}>
              <View style={{flexDirection:'row',alignItems:'flex-start',gap:S.md,marginBottom:S.md}}>
                <View style={{flex:1}}>
                  <Text style={{fontSize:F.base,fontWeight:'800',color:C.text,marginBottom:3}} numberOfLines={1}>{v.title}</Text>
                  <Text style={{fontSize:F.md,fontWeight:'700',color:C.primary}}>{v.price}</Text>
                </View>
                <View style={{borderRadius:R.full,paddingHorizontal:10,paddingVertical:4,backgroundColor:s.bg}}>
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:s.color}}>{s.label}</Text>
                </View>
              </View>
              <View style={{height:0.5,backgroundColor:C.border,marginBottom:S.md}} />
              <View style={{gap:S.sm,marginBottom:S.md}}>
                <View style={{flexDirection:'row',alignItems:'center',gap:S.sm}}>
                  <Ionicons name="calendar" size={14} color={C.primary} />
                  <Text style={{fontSize:F.sm,color:C.textMd,fontWeight:'500'}}>{v.date} à {v.time}</Text>
                </View>
                <View style={{flexDirection:'row',alignItems:'center',gap:S.sm}}>
                  <Ionicons name="person" size={14} color={C.primary} />
                  <Text style={{fontSize:F.sm,color:C.textMd,fontWeight:'500'}}>{v.owner}</Text>
                </View>
              </View>
              <View style={{flexDirection:'row',gap:S.sm}}>
                <TouchableOpacity style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:9,borderRadius:R.lg,backgroundColor:C.primaryLt}}>
                  <Ionicons name="chatbubble-ellipses" size={15} color={C.primary} />
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary}}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:9,borderRadius:R.lg,backgroundColor:C.primaryLt}}>
                  <Ionicons name="call" size={15} color={C.primary} />
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:C.primary}}>Appeler</Text>
                </TouchableOpacity>
                {v.status==='pending'&&<TouchableOpacity style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:9,borderRadius:R.lg,backgroundColor:'#DC262615'}}>
                  <Ionicons name="close" size={15} color="#DC2626" />
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:'#DC2626'}}>Annuler</Text>
                </TouchableOpacity>}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}