var apiModule = require('../api/client');
var api = apiModule.api;

async function savePushToken(_, authToken) {
  try {
    var Device = require('expo-device');
    if (!Device.isDevice) return;
    var Notifications = require('expo-notifications');
    var perm = await Notifications.getPermissionsAsync();
    if (perm.status !== 'granted') {
      perm = await Notifications.requestPermissionsAsync();
    }
    if (perm.status !== 'granted') return;
    var pushToken = await Notifications.getExpoPushTokenAsync({
      projectId: '464bd9e2-a81f-4554-84f3-18ceb455d9ac',
    });
    if (pushToken && pushToken.data) {
      await api.patch('/users/profile', { pushToken: pushToken.data }, authToken);
    }
  } catch(e) {
    console.log('Push ignored:', e.message);
  }
}

module.exports = { savePushToken: savePushToken };