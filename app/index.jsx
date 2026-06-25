import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
var authModule = require('../src/store/auth');
var hooks = require('../src/store/hooks');
var useAuth = hooks.useAuth;

export default function Index() {
  var auth = useAuth();
  var readyS = useState(false);
  var ready = readyS[0];
  var setReady = readyS[1];

  useEffect(function() {
    authModule.authStore.load().finally(function() { setReady(true); });
  }, []);

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