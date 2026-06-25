import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
var t = require('../../src/theme');
var C=t.C; var F=t.F;
export default function Publish() {
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg,alignItems:'center',justifyContent:'center'}}>
      <Text style={{fontSize:48,marginBottom:12}}>➕</Text>
      <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Publier une annonce</Text>
      <Text style={{fontSize:F.sm,color:C.muted,marginTop:8}}>Bientôt disponible</Text>
    </SafeAreaView>
  );
}