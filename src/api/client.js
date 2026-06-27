var BASE_URL = 'https://deukway-backend-production.up.railway.app/api';

function getHeaders(token) {
  var headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return headers;
}

var api = {
  post: function(path, body, token) {
    return fetch(BASE_URL + path, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(body),
    }).then(function(r) { return r.json(); });
  },
  get: function(path, token) {
    return fetch(BASE_URL + path, {
      method: 'GET',
      headers: getHeaders(token),
    }).then(function(r) { return r.json(); });
  },
  patch: function(path, body, token) {
    return fetch(BASE_URL + path, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify(body),
    }).then(function(r) { return r.json(); });
  },
  delete: function(path, token) {
    return fetch(BASE_URL + path, {
      method: 'DELETE',
      headers: getHeaders(token),
    }).then(function(r) { return r.json(); });
  },
};

module.exports = { api: api, BASE_URL: BASE_URL };