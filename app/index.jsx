import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
var authModule = require('../src/store/auth');

export default function Index() {
  var countS = useState(0); var setCount = countS[1];
  var readyS = useState(false); var ready = readyS[0]; var setReady = readyS[1];

  useEffect(function() {
    authModule.authStore.load().finally(function() { setReady(true); });
    return authModule.authStore.subscribe(function() {
      setCount(function(n) { return n + 1; });
    });
  }, []);

  var auth = authModule.authStore.getState();

  if (!ready) {
    return (
      <View style={{ flex:1, backgroundColor:'#D4821A', alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  if (!auth.isAuthenticated) return <Redirect href="/auth/welcome" />;
  if (auth.user && auth.user.role === 'OWNER') return <Redirect href="/owner/dashboard" />;
  return <Redirect href="/tabs/home" />;
}