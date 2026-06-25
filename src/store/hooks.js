var React = require('react');
var authModule = require('./auth');
var listingsModule = require('./listings');

function useAuth() {
  var s = React.useState(authModule.authStore.getState());
  var setState = s[1];
  React.useEffect(function() {
    setState(authModule.authStore.getState());
    return authModule.authStore.subscribe(function(ns) { setState(Object.assign({},ns)); });
  }, []);
  return s[0];
}

function useListings() {
  var s = React.useState(listingsModule.listingsStore.getState());
  var setState = s[1];
  React.useEffect(function() {
    setState(listingsModule.listingsStore.getState());
    return listingsModule.listingsStore.subscribe(function(ns) { setState(Object.assign({},ns)); });
  }, []);
  return s[0];
}

module.exports = { useAuth:useAuth, useListings:useListings };