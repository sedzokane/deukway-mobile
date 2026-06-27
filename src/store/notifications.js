var Notifications = require('expo-notifications');
var Device = require('expo-device');
var Platform = require('react-native').Platform;
var apiModule = require('../api/client');
var api = apiModule.api;

async function registerForPushNotifications(token) {
  if (!Device.isDevice) return null;
  
  var perm = await Notifications.getPermissionsAsync();
  if (perm.status !== 'granted') {
    perm = await Notifications.requestPermissionsAsync();
  }
  if (perm.status !== 'granted') return null;

  var pushToken = await Notifications.getExpoPushTokenAsync({
    projectId: '464bd9e2-a81f-4554-84f3-18ceb455d9ac',
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return pushToken.data;
}

async function savePushToken(token, authToken) {
  var pushToken = await registerForPushNotifications(authToken);
  if (pushToken) {
    await api.patch('/users/profile', { pushToken: pushToken }, authToken);
  }
}

module.exports = { registerForPushNotifications, savePushToken };