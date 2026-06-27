var apiModule = require('../api/client');
var api = apiModule.api;

var state = { items:[], current:null, loading:false, myListings:[] };
var listeners = [];

function setState(partial) {
  state = Object.assign({}, state, partial);
  listeners.forEach(function(l) { l(state); });
}

var listingsStore = {
  getState: function() { return state; },
  subscribe: function(l) {
    listeners.push(l);
    return function() { listeners = listeners.filter(function(x) { return x!==l; }); };
  },

  fetch: function(filters, token) {
    setState({ loading:true });
    var query = '';
    if (filters) {
      var params = [];
      Object.keys(filters).forEach(function(k) {
        if (filters[k]) params.push(k+'='+filters[k]);
      });
      if (params.length) query = '?' + params.join('&');
    }
    return api.get('/listings' + query, token).then(function(data) {
      setState({ items: data.items || data, loading:false });
    }).catch(function() { setState({ loading:false }); });
  },

  fetchOne: function(id, token) {
    setState({ loading:true });
    return api.get('/listings/'+id, token).then(function(data) {
      setState({ current:data, loading:false });
    }).catch(function() { setState({ loading:false }); });
  },

  fetchMyListings: function(token) {
    setState({ loading:true });
    return api.get('/listings/my', token).then(function(data) {
      setState({ myListings: Array.isArray(data) ? data : [], loading:false });
    }).catch(function() { setState({ loading:false }); });
  },

  create: function(data, token) {
    return api.post('/listings', data, token).then(function(listing) {
      setState({ myListings: [listing].concat(state.myListings) });
      return listing;
    });
  },

  update: function(id, data, token) {
    return api.patch('/listings/'+id, data, token).then(function(listing) {
      setState({
        myListings: state.myListings.map(function(l) { return l.id===id ? listing : l; }),
        current: state.current && state.current.id===id ? listing : state.current,
      });
      return listing;
    });
  },

  toggleFav: function(id, token) {
    return api.post('/favorites/'+id, {}, token).then(function(data) {
      setState({
        items: state.items.map(function(l) {
          return l.id===id ? Object.assign({},l,{isFavorite:data.isFavorite}) : l;
        }),
        current: state.current && state.current.id===id
          ? Object.assign({},state.current,{isFavorite:data.isFavorite})
          : state.current,
      });
    });
  },
};

module.exports = { listingsStore:listingsStore };