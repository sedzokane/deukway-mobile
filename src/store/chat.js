var socketModule = require('socket.io-client');
var io = socketModule.io;
var apiModule = require('../api/client');
var api = apiModule.api;
var BASE_URL = apiModule.BASE_URL;

var SOCKET_URL = BASE_URL.replace('/api', '');

var state = {
  socket: null,
  connected: false,
  conversations: [],
  messages: [],
  currentUserId: null,
};

var listeners = [];

function setState(partial) {
  state = Object.assign({}, state, partial);
  listeners.forEach(function(l) { l(state); });
}

var chatStore = {
  getState: function() { return state; },
  subscribe: function(l) {
    listeners.push(l);
    return function() { listeners = listeners.filter(function(x) { return x!==l; }); };
  },

  connect: function(token, userId) {
    if (state.socket) return;
    var socket = io(SOCKET_URL + '/chat', {
      auth: { token: token },
      transports: ['websocket'],
    });

    socket.on('connect', function() {
      setState({ connected: true });
    });

    socket.on('disconnect', function() {
      setState({ connected: false });
    });

    socket.on('new_message', function(message) {
      setState({ messages: state.messages.concat(message) });
    });

    setState({ socket: socket, currentUserId: userId });
  },

  disconnect: function() {
    if (state.socket) {
      state.socket.disconnect();
      setState({ socket: null, connected: false, messages: [] });
    }
  },

  joinConversation: function(receiverId) {
    if (state.socket) {
      state.socket.emit('join_conversation', { receiverId: receiverId });
    }
  },

  sendMessage: function(receiverId, content) {
    if (state.socket) {
      state.socket.emit('send_message', { receiverId: receiverId, content: content });
    }
  },

  markRead: function(senderId) {
    if (state.socket) {
      state.socket.emit('mark_read', { senderId: senderId });
    }
  },

  loadConversations: function(token) {
    return api.get('/chat/conversations', token).then(function(data) {
      setState({ conversations: Array.isArray(data) ? data : [] });
    });
  },

  loadMessages: function(userId, token) {
    setState({ messages: [] });
    return api.get('/chat/' + userId, token).then(function(data) {
      setState({ messages: Array.isArray(data) ? data : [] });
    });
  },
};

module.exports = { chatStore: chatStore };