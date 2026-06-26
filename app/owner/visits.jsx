import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

var VISITS = [
  {id:'v1',tenant:'Mamadou Fall',phone:'+221 77 123 4567',listing:'Studio meublé - Plateau',date:'Sam 28 Juin',time:'10h00',status:'pending'},
  {id:'v2',tenant:'Fatou Diallo',phone:'+221 76 555 4433',listing:'Appartement F3 - Mermoz',date:'Dim 29 Juin',time:'14h30',status:'confirmed'},
  {id:'v3',tenant:'Ibrahima Sow',phone:'+221 70 111 2233',listing:'Studio - Almadies',date:'Lun 30 Juin',time:'11h00',status:'pending'},
];

var STATUS = {
  confirmed:{label:'Confirmée ✓',color:'#059669',bg:'#05966922'},
  pending:{label:'En attente',color:'#D4821A',bg:'#FEF4E7'},
};

export default function Visits() {
  function handleConfirm(id) {
    Toast.show({ type:'success', text1:'Visite confirmée', text2:'Le locataire sera notifié', visibilityTime:2000 });
  }
  function handleRefuse(id) {
    Toast.show({ type:'error', text1:'Visite refusée', text2:'Le locataire sera notifié', visibilityTime:2000 });
  }

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#0F2E22','#1B4F3A','#2D7A5F']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.xl,paddingTop:S.sm}}>
          <Text style={{fontSize:22,fontWeight:'900',color:'#fff'}}>Demandes de visites</Text>
          <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)',marginTop:2}}>{VISITS.length} demandes</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:S.lg,gap:S.md}}>
        {VISITS.map(function(v){
          var s = STATUS[v.status];
          return (
            <View key={v.id} style={{backgroundColor:'#fff',borderRadius:R.xl,padding:S.lg,elevation:4}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:S.md}}>
                <View style={{flex:1,marginRight:S.md}}>
                  <Text style={{fontSize:F.base,fontWeight:'800',color:C.text,marginBottom:3}}>{v.tenant}</Text>
                  <Text style={{fontSize:F.xs,color:C.muted,marginBottom:3}}>{v.phone}</Text>
                  <Text style={{fontSize:F.sm,fontWeight:'600',color:C.owner}} numberOfLines={1}>{v.listing}</Text>
                </View>
                <View style={{borderRadius:R.full,paddingHorizontal:10,paddingVertical:4,backgroundColor:s.bg}}>
                  <Text style={{fontSize:F.xs,fontWeight:'700',color:s.color}}>{s.label}</Text>
                </View>
              </View>
              <View style={{height:0.5,backgroundColor:C.border,marginBottom:S.md}} />
              <View style={{flexDirection:'row',alignItems:'center',gap:S.sm,marginBottom:S.md}}>
                <Ionicons name="calendar" size={14} color={C.owner} />
                <Text style={{fontSize:F.sm,color:C.textMd,fontWeight:'500'}}>{v.date} à {v.time}</Text>
              </View>
              {v.status==='pending'&&(
                <View style={{flexDirection:'row',gap:S.sm}}>
                  <TouchableOpacity onPress={function(){handleConfirm(v.id);}} style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:10,borderRadius:R.lg,backgroundColor:'#05996922'}}>
                    <Ionicons name="checkmark-circle" size={16} color='#059669' />
                    <Text style={{fontSize:F.sm,fontWeight:'700',color:'#059669'}}>Confirmer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={function(){handleRefuse(v.id);}} style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:10,borderRadius:R.lg,backgroundColor:'#FFF0F0'}}>
                    <Ionicons name="close-circle" size={16} color='#DC2626' />
                    <Text style={{fontSize:F.sm,fontWeight:'700',color:'#DC2626'}}>Refuser</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}