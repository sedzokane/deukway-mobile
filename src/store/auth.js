var AsyncStorage = require('@react-native-async-storage/async-storage').default;
var apiModule = require('../api/client');
var api = apiModule.api;
var BASE_URL = apiModule.BASE_URL;

var state = {
  user: null,
  token: null,
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

var authStore = {
  getState: getState,
  subscribe: subscribe,

  load: function() {
    return Promise.all([
      AsyncStorage.getItem('dkw_user'),
      AsyncStorage.getItem('dkw_token'),
    ]).then(function(results) {
      var raw = results[0];
      var token = results[1];
      if (raw && token) {
        try {
          var user = JSON.parse(raw);
          setState({ user: user, token: token, isAuthenticated: true });
        } catch(e) {}
      }
    }).catch(function() {});
  },

  setUser: function(user) {
    return AsyncStorage.setItem('dkw_user', JSON.stringify(user)).then(function() {
      setState({ user: user });
    }).catch(function() {
      setState({ user: user });
    });
  },

  login: function(phone, password) {
    setState({ isLoading: true });
    return api.post('/auth/login', { phone: phone, password: password })
      .then(function(data) {
        if (data.token) {
          return api.get('/auth/me', data.token).then(function(me) {
            var user = me.id ? me : data.user;
            return Promise.all([
              AsyncStorage.setItem('dkw_user', JSON.stringify(user)),
              AsyncStorage.setItem('dkw_token', data.token),
            ]).then(function() {
              setState({ user: user, token: data.token, isAuthenticated: true, isLoading: false });
            });
          }).catch(function() {
            return Promise.all([
              AsyncStorage.setItem('dkw_user', JSON.stringify(data.user)),
              AsyncStorage.setItem('dkw_token', data.token),
            ]).then(function() {
              setState({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
            });
          });
        } else {
          setState({ isLoading: false });
          return Promise.reject(data.message || 'Erreur de connexion');
        }
      }).catch(function(err) {
        setState({ isLoading: false });
        return Promise.reject(err);
      });
  },

  register: function(data) {
    setState({ isLoading: true });
    var avatarUri = data.avatar;
    var avatarFile = data.avatarFile;
    var registerData = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      password: data.password,
      role: data.role,
    };

    return api.post('/auth/register', registerData)
      .then(function(res) {
        if (res.token) {
          if (avatarFile || avatarUri) {
            var formData = new FormData();
            if (avatarFile) {
              formData.append('file', avatarFile);
            } else {
              formData.append('file', {
                uri: avatarUri,
                type: 'image/jpeg',
                name: 'avatar.jpg',
              });
            }
            return fetch(BASE_URL + '/media/avatar', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + res.token,
                'ngrok-skip-browser-warning': 'true',
              },
              body: formData,
            }).then(function(r) { return r.json(); })
              .then(function(mediaRes) {
                var user = Object.assign({}, res.user, { avatar: mediaRes.avatar });
                return Promise.all([
                  AsyncStorage.setItem('dkw_user', JSON.stringify(user)),
                  AsyncStorage.setItem('dkw_token', res.token),
                ]).then(function() {
                  setState({ user: user, token: res.token, isAuthenticated: true, isLoading: false });
                });
              }).catch(function() {
                return Promise.all([
                  AsyncStorage.setItem('dkw_user', JSON.stringify(res.user)),
                  AsyncStorage.setItem('dkw_token', res.token),
                ]).then(function() {
                  setState({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
                });
              });
          } else {
            return Promise.all([
              AsyncStorage.setItem('dkw_user', JSON.stringify(res.user)),
              AsyncStorage.setItem('dkw_token', res.token),
            ]).then(function() {
              setState({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
            });
          }
        } else {
          setState({ isLoading: false });
          return Promise.reject(res.message || 'Erreur inscription');
        }
      }).catch(function(err) {
        setState({ isLoading: false });
        return Promise.reject(err);
      });
  },

  logout: function() {
    setState({ user: null, token: null, isAuthenticated: false });
    return Promise.all([
      AsyncStorage.removeItem('dkw_user'),
      AsyncStorage.removeItem('dkw_token'),
    ]).catch(function() {});
  },
};

module.exports = { authStore: authStore };