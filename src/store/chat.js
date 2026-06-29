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
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', function() {
      console.log('Socket connected');
      setState({ connected: true });
    });

    socket.on('disconnect', function() {
      console.log('Socket disconnected');
      setState({ connected: false });
    });

    socket.on('new_message', function(message) {
      console.log('New message received:', message.id, 'type:', message.type);
      setState({ messages: state.messages.concat(message) });
    });

    socket.on('messages_read', function(data) {
      setState({
        messages: state.messages.map(function(m) {
          return m.receiverId === data.userId ? Object.assign({}, m, { isRead: true }) : m;
        }),
      });
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
    if (!state.socket) return;
    if (state.connected) {
      state.socket.emit('join_conversation', { receiverId: receiverId });
    } else {
      state.socket.once('connect', function() {
        state.socket.emit('join_conversation', { receiverId: receiverId });
      });
    }
  },

  sendMessage: function(receiverId, content, type) {
    if (state.socket) {
      state.socket.emit('send_message', {
        receiverId: receiverId,
        content: content,
        type: type || 'text',
      });
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