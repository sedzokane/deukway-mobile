import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
var t = require('../../src/theme');
var C=t.C; var F=t.F; var S=t.S;

export default function Notifications() {
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <View style={{flexDirection:'row',alignItems:'center',gap:S.md,padding:S.lg,backgroundColor:'#fff',borderBottomWidth:0.5,borderBottomColor:C.border}}>
        <TouchableOpacity onPress={function(){router.back();}}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Notifications</Text>
      </View>
      <View style={{flex:1,alignItems:'center',justifyContent:'center',gap:12}}>
        <Ionicons name="notifications-off" size={48} color={C.gray} />
        <Text style={{fontSize:F.base,color:C.muted}}>Aucune notification</Text>
      </View>
    </SafeAreaView>
  );
}