import { useEffect, useRef, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
var authModule = require('../src/store/auth');

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  var readyS = useState(false); var ready = readyS[0]; var setReady = readyS[1];
  var countS = useState(0); var setCount = countS[1];
  var readyRef = useRef(false);

  useEffect(function() {
    authModule.authStore.load().finally(function() {
      readyRef.current = true;
      setReady(true);
    });
    return authModule.authStore.subscribe(function() {
      if (!readyRef.current) return;
      var auth = authModule.authStore.getState();
      SplashScreen.hideAsync();
      if (!auth.isAuthenticated) {
        router.replace('/auth/welcome');
      } else if (auth.user && auth.user.role === 'OWNER') {
        router.replace('/owner/dashboard');
      } else {
        router.replace('/tabs/home');
      }
      setCount(function(n) { return n + 1; });
    });
  }, []);

  useEffect(function() {
    if (!ready) return;
    SplashScreen.hideAsync();
    var auth = authModule.authStore.getState();
    if (!auth.isAuthenticated) {
      router.replace('/auth/welcome');
    } else if (auth.user && auth.user.role === 'OWNER') {
      router.replace('/owner/dashboard');
    } else {
      router.replace('/tabs/home');
    }
  }, [ready]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
      <Toast />
    </>
  );
}