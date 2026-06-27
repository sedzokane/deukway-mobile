import { useEffect, useRef, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
var authModule = require('../src/store/auth');
var notifModule = require('../src/store/notifications');

SplashScreen.preventAutoHideAsync();

var Notifications = null;
try { Notifications = require('expo-notifications'); } catch(e) {}

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async function() {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });
}

export default function RootLayout() {
  var readyS = useState(false); var ready = readyS[0]; var setReady = readyS[1];
  var countS = useState(0); var setCount = countS[1];
  var readyRef = useRef(false);
  var notifListener = useRef(null);
  var responseListener = useRef(null);

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

      if (auth.isAuthenticated && auth.token) {
        try { notifModule.savePushToken(null, auth.token); } catch(e) {}
      }
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

    if (auth.isAuthenticated && auth.token) {
      try { notifModule.savePushToken(null, auth.token); } catch(e) {}
    }

    if (Notifications) {
      try {
        notifListener.current = Notifications.addNotificationReceivedListener(function(notification) {
          Toast.show({
            type: 'info',
            text1: notification.request.content.title,
            text2: notification.request.content.body,
            visibilityTime: 4000,
          });
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(function(response) {
          var data = response.notification.request.content.data;
          if (data && data.type === 'message' && data.senderId) {
            router.push('/chat/' + data.senderId);
          } else if (data && data.type === 'visit') {
            router.push('/tabs/visits');
          }
        });
      } catch(e) {}
    }

    return function() {
      if (Notifications) {
        try {
          if (notifListener.current) Notifications.removeNotificationSubscription(notifListener.current);
          if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
        } catch(e) {}
      }
    };
  }, [ready]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
      <Toast />
    </>
  );
}