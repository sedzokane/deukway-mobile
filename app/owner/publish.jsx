import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
var t = require('../../src/theme');
var C=t.C; var F=t.F; var S=t.S;
export default function Screen() {
  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#0F2E22','#1B4F3A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.xl,paddingTop:S.sm}}>
          <Text style={{fontSize:22,fontWeight:'900',color:'#fff'}}>Bientôt disponible</Text>
        </SafeAreaView>
      </LinearGradient>
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <Text style={{fontSize:48,marginBottom:12}}>🏠</Text>
        <Text style={{fontSize:F.sm,color:C.muted}}>En cours de développement</Text>
      </View>
    </View>
  );
}