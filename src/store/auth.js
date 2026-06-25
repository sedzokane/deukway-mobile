var AsyncStorage = require('@react-native-async-storage/async-storage').default;

var TENANT = { id:'u1', firstName:'Mamadou', lastName:'Fall', phone:'+221 77 123 4567', role:'TENANT', isVerified:true, isPremium:false };
var OWNER  = { id:'u2', firstName:'Amadou',  lastName:'Koné', phone:'+221 77 000 0000', role:'OWNER',  isVerified:true, isPremium:true };

var state = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

var listeners = [];

function setState(partial) {
  state = Object.assign({}, state, partial);
  listeners.forEach(function(l) { l(state); });
}

function getState() { return state; }

function subscribe(listener) {
  listeners.push(listener);
  return function() {
    listeners = listeners.filter(function(l) { return l !== listener; });
  };
}

function wait(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms || 700); });
}

var authStore = {
  getState: getState,
  subscribe: subscribe,

  load: function() {
    return AsyncStorage.getItem('dkw_user').then(function(raw) {
      if (raw) { setState({ user: JSON.parse(raw), isAuthenticated: true }); }
    }).catch(function() {});
  },

  login: function(phone, password) {
    setState({ isLoading: true });
    return wait(700).then(function() {
      var user = String(phone).trim().slice(-1) === '0' ? OWNER : TENANT;
      return AsyncStorage.setItem('dkw_user', JSON.stringify(user)).then(function() {
        setState({ user: user, isAuthenticated: true, isLoading: false });
      });
    });
  },

  register: function(data) {
    setState({ isLoading: true });
    return wait(700).then(function() { setState({ isLoading: false }); });
  },

  verifyOtp: function(phone, code) {
    setState({ isLoading: true });
    return wait(900).then(function() {
      var user = code === '654321' ? OWNER : TENANT;
      return AsyncStorage.setItem('dkw_user', JSON.stringify(user)).then(function() {
        setState({ user: user, isAuthenticated: true, isLoading: false });
      });
    });
  },

  logout: function() {
    return AsyncStorage.removeItem('dkw_user').then(function() {
      setState({ user: null, isAuthenticated: false });
    });
  },
};

module.exports = { authStore: authStore };