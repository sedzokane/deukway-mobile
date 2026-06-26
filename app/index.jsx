import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex:1, backgroundColor:'#D4821A', alignItems:'center', justifyContent:'center' }}>
      <ActivityIndicator color="#fff" size="large" />
    </View>
  );
}