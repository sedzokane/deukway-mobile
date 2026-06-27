var React = require('react');
var authModule = require('./auth');
var listingsModule = require('./listings');

function useAuth() {
  var forceUpdate = React.useState(0)[1];
  React.useEffect(function() {
    forceUpdate(function(n) { return n + 1; });
    return authModule.authStore.subscribe(function() {
      forceUpdate(function(n) { return n + 1; });
    });
  }, []);
  return authModule.authStore.getState();
}

function useListings() {
  var forceUpdate = React.useState(0)[1];
  React.useEffect(function() {
    forceUpdate(function(n) { return n + 1; });
    return listingsModule.listingsStore.subscribe(function() {
      forceUpdate(function(n) { return n + 1; });
    });
  }, []);
  return listingsModule.listingsStore.getState();
}

function getToken() {
  return authModule.authStore.getState().token;
}

module.exports = { useAuth:useAuth, useListings:useListings, getToken:getToken };