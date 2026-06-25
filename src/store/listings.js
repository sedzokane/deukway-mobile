function wait(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms || 500); });
}

function mk(urls) {
  return urls.map(function(url, i) { return { id:'m'+i, url:url, order:i }; });
}

var studioPhotos = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
];
var appartPhotos = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
];
var chambrePhotos = [
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
  'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800',
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
];

var DATA = [
  { id:'l1', title:'Studio meublé - Plateau', description:'Beau studio entièrement meublé au coeur du Plateau. Climatisé, eau et électricité incluses. Gardien 24h/24.', type:'STUDIO', price:120000, surface:32, rooms:1, city:'Dakar', neighborhood:'Plateau', isFurnished:true, hasWifi:true, hasElectricity:true, hasWater:true, hasParking:false, hasAC:true, deposit:240000, isVerified:true, viewCount:142, media:mk(studioPhotos), owner:{id:'o1',firstName:'Amadou',lastName:'Koné',phone:'+221779876543'}, isFavorite:true },
  { id:'l2', title:'Chambre colocation - Liberté 6', description:'Grande chambre dans un appartement en colocation. Quartier calme et résidentiel.', type:'COLOCATION', price:65000, surface:18, city:'Dakar', neighborhood:'Liberté 6', isFurnished:false, hasWifi:true, hasElectricity:false, hasWater:true, hasParking:true, hasAC:false, deposit:130000, isVerified:true, viewCount:87, media:mk(chambrePhotos), owner:{id:'o2',firstName:'Fatou',lastName:'Diallo',phone:'+221765554433'}, isFavorite:false },
  { id:'l3', title:'Appartement F3 - Mermoz', description:'Grand appartement F3 climatisé dans le quartier résidentiel de Mermoz. Salon spacieux, 2 chambres.', type:'APARTMENT', price:280000, surface:85, rooms:3, city:'Dakar', neighborhood:'Mermoz', isFurnished:true, hasWifi:true, hasElectricity:true, hasWater:true, hasParking:true, hasAC:true, deposit:560000, isVerified:false, viewCount:203, media:mk(appartPhotos), owner:{id:'o3',firstName:'Ibrahima',lastName:'Sow',phone:'+221701112233'}, isFavorite:false },
  { id:'l4', title:'Chambre indépendante - Point E', description:'Chambre indépendante avec entrée séparée. Proche de l université.', type:'ROOM', price:45000, surface:14, city:'Dakar', neighborhood:'Point E', isFurnished:false, hasWifi:false, hasElectricity:true, hasWater:false, hasParking:false, hasAC:false, deposit:90000, isVerified:false, viewCount:56, media:mk(chambrePhotos), owner:{id:'o4',firstName:'Mariama',lastName:'Ba',phone:'+221784445566'}, isFavorite:false },
  { id:'l5', title:'Studio moderne - Almadies', description:'Studio neuf et moderne aux Almadies. Vue mer partielle. Résidence sécurisée.', type:'STUDIO', price:180000, surface:28, city:'Dakar', neighborhood:'Almadies', isFurnished:true, hasWifi:true, hasElectricity:true, hasWater:true, hasParking:true, hasAC:true, deposit:360000, isVerified:true, viewCount:318, media:mk(studioPhotos), owner:{id:'o5',firstName:'Ousmane',lastName:'Diop',phone:'+221772223344'}, isFavorite:true },
  { id:'l6', title:'Colocation étudiante - Fann', description:'Belle maison en colocation proche de l UCAD. 4 chambres disponibles.', type:'COLOCATION', price:55000, surface:20, city:'Dakar', neighborhood:'Fann', isFurnished:true, hasWifi:true, hasElectricity:true, hasWater:true, hasParking:false, hasAC:false, deposit:110000, isVerified:false, viewCount:124, media:mk(chambrePhotos), owner:{id:'o6',firstName:'Aissatou',lastName:'Ndiaye',phone:'+221763334455'}, isFavorite:false },
];

var state = { items:[], current:null, loading:false };
var listeners = [];

function setState(partial) {
  state = Object.assign({}, state, partial);
  listeners.forEach(function(l) { l(state); });
}

var listingsStore = {
  getState: function() { return state; },
  subscribe: function(l) { listeners.push(l); return function() { listeners = listeners.filter(function(x) { return x!==l; }); }; },

  fetch: function(type) {
    setState({ loading:true });
    return wait(500).then(function() {
      var items = type ? DATA.filter(function(l) { return l.type===type; }) : DATA.slice();
      setState({ items:items, loading:false });
    });
  },

  fetchOne: function(id) {
    setState({ loading:true });
    return wait(300).then(function() {
      var found = null;
      for (var i=0; i<DATA.length; i++) { if (DATA[i].id===id) { found=DATA[i]; break; } }
      setState({ current:found, loading:false });
    });
  },

  toggleFav: function(id) {
    var s = state;
    setState({
      items: s.items.map(function(l) { return l.id===id ? Object.assign({},l,{isFavorite:!l.isFavorite}) : l; }),
      current: s.current && s.current.id===id ? Object.assign({},s.current,{isFavorite:!s.current.isFavorite}) : s.current,
    });
  },
};

module.exports = { listingsStore:listingsStore };