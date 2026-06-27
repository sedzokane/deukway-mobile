import { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
var hooks = require('../../src/store/hooks');
var chatModule = require('../../src/store/chat');
var apiModule = require('../../src/api/client');
var api = apiModule.api;
var BASE_URL = apiModule.BASE_URL;
var useAuth = hooks.useAuth;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

function uploadFile(file, token, onSuccess, onError) {
  var formData = new FormData();
  formData.append('file', file);
  fetch(BASE_URL + '/chat/upload', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'ngrok-skip-browser-warning': 'true' },
    body: formData,
  }).then(function(r) { return r.json(); })
    .then(function(data) { if (data.url) onSuccess(data.url); })
    .catch(onError);
}

export default function ChatScreen() {
  var params = useLocalSearchParams(); var receiverId = params.userId;
  var auth = useAuth(); var user = auth.user;
  var msgS = useState(''); var msg = msgS[0]; var setMsg = msgS[1];
  var messagesS = useState([]); var messages = messagesS[0]; var setMessages = messagesS[1];
  var otherUserS = useState(null); var otherUser = otherUserS[0]; var setOtherUser = otherUserS[1];
  var showAttachS = useState(false); var showAttach = showAttachS[0]; var setShowAttach = showAttachS[1];
  var uploadingS = useState(false); var uploading = uploadingS[0]; var setUploading = uploadingS[1];
  var listRef = useRef(null);

  useEffect(function() {
    if (!user) return;
    var token = getToken();
    chatModule.chatStore.loadMessages(receiverId, token).then(function() {
      setMessages(chatModule.chatStore.getState().messages.slice());
    });
    api.get('/users/'+receiverId, token).then(function(data) {
      setOtherUser(data);
    }).catch(function(){});
    if (!chatModule.chatStore.getState().socket) {
      chatModule.chatStore.connect(token, user.id);
    }
    chatModule.chatStore.joinConversation(receiverId);
    chatModule.chatStore.markRead(receiverId);
    var unsub = chatModule.chatStore.subscribe(function(state) {
      setMessages(state.messages.slice());
    });
    return function() { unsub(); };
  }, [receiverId, user]);

  useEffect(function() {
    if (listRef.current && messages.length > 0) {
      setTimeout(function() {
        if (listRef.current) listRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  function handleSend() {
    if (!msg.trim()) return;
    chatModule.chatStore.sendMessage(receiverId, msg.trim());
    setMsg('');
  }

  function pickAndUpload(accept, mediaType) {
    setShowAttach(false);
    var token = getToken();
    if (typeof document !== 'undefined') {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        uploadFile(file, token, function(url) {
          setUploading(false);
          chatModule.chatStore.sendMessage(receiverId, url, mediaType);
        }, function() {
          setUploading(false);
          Alert.alert('Erreur','Impossible d envoyer le fichier');
        });
      };
      input.click();
    } else {
      var options = { quality: 0.7 };
      if (mediaType === 'image') {
        options.mediaTypes = ImagePicker.MediaType.images;
      } else if (mediaType === 'video') {
        options.mediaTypes = ImagePicker.MediaType.videos;
      } else {
        options.mediaTypes = [ImagePicker.MediaType.images, ImagePicker.MediaType.videos];
      }
      ImagePicker.launchImageLibraryAsync(options).then(function(result) {
        if (!result.canceled) {
          var asset = result.assets[0];
          var isVideo = asset.type === 'video';
          var formFile = {
            uri: asset.uri,
            type: isVideo ? 'video/mp4' : 'image/jpeg',
            name: isVideo ? 'video.mp4' : 'photo.jpg',
          };
          setUploading(true);
          uploadFile(formFile, token, function(url) {
            setUploading(false);
            chatModule.chatStore.sendMessage(receiverId, url, isVideo ? 'video' : 'image');
          }, function() {
            setUploading(false);
            Alert.alert('Erreur','Impossible d envoyer');
          });
        }
      });
    }
  }

  function pickDocument() {
    setShowAttach(false);
    var token = getToken();
    if (typeof document !== 'undefined') {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt';
      input.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        uploadFile(file, token, function(url) {
          setUploading(false);
          chatModule.chatStore.sendMessage(receiverId, url, 'file');
        }, function() {
          setUploading(false);
          Alert.alert('Erreur','Impossible d envoyer le fichier');
        });
      };
      input.click();
    } else {
      Alert.alert('Fichier','Utilisez la version web pour envoyer des fichiers');
    }
  }

  function renderMessage(item) {
    var m = item.item;
    var isMine = m.sender && m.sender.id === user.id;
    var isImage = m.type === 'image' || (m.content && m.content.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i));
    var isVideo = m.type === 'video' || (m.content && m.content.match(/\.(mp4|mov|avi|webm)(\?|$)/i));
    var isFile = m.type === 'file' || (!isImage && !isVideo && m.content && m.content.startsWith('http') && m.content.match(/\.(pdf|doc|docx|xls|xlsx|txt)(\?|$)/i));

    return (
      <View style={{flexDirection:'row',justifyContent:isMine?'flex-end':'flex-start',marginBottom:S.sm,paddingHorizontal:S.lg}}>
        {!isMine&&(
          m.sender&&m.sender.avatar
            ? <Image source={{uri:m.sender.avatar}} style={{width:32,height:32,borderRadius:16,marginRight:S.sm}} />
            : <LinearGradient colors={['#F0A830','#D4821A']} style={{width:32,height:32,borderRadius:16,alignItems:'center',justifyContent:'center',marginRight:S.sm}}>
                <Text style={{fontSize:12,fontWeight:'900',color:'#fff'}}>{m.sender?m.sender.firstName[0]:''}</Text>
              </LinearGradient>
        )}
        <View style={{maxWidth:'75%'}}>
          {isImage&&(
            <Image source={{uri:m.content}} style={{width:200,height:150,borderRadius:12}} resizeMode="cover" />
          )}
          {isVideo&&(
            <TouchableOpacity style={{width:200,height:150,borderRadius:12,backgroundColor:'#000',alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="play-circle" size={48} color="#fff" />
              <Text style={{color:'#fff',fontSize:F.xs,marginTop:4}}>Appuyer pour voir</Text>
            </TouchableOpacity>
          )}
          {isFile&&(
            <TouchableOpacity style={{flexDirection:'row',alignItems:'center',gap:S.sm,backgroundColor:isMine?C.primary:'#fff',borderRadius:12,padding:S.md,elevation:2}}>
              <Ionicons name="document" size={24} color={isMine?'#fff':C.primary} />
              <Text style={{fontSize:F.sm,fontWeight:'600',color:isMine?'#fff':C.text}} numberOfLines={1}>Fichier</Text>
            </TouchableOpacity>
          )}
          {!isImage&&!isVideo&&!isFile&&(
            <View style={{backgroundColor:isMine?C.primary:'#fff',borderRadius:18,borderBottomRightRadius:isMine?4:18,borderBottomLeftRadius:isMine?18:4,paddingHorizontal:S.md,paddingVertical:S.sm,elevation:2}}>
              <Text style={{fontSize:F.base,color:isMine?'#fff':C.text,lineHeight:20}}>{m.content}</Text>
            </View>
          )}
          <Text style={{fontSize:F.xs,color:C.muted,marginTop:2,textAlign:isMine?'right':'left'}}>
            {new Date(m.createdAt).toLocaleTimeString('fr-SN',{hour:'2-digit',minute:'2-digit'})}
            {isMine&&<Text> {m.isRead?'✓✓':'✓'}</Text>}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
      <View style={{flex:1,backgroundColor:C.bg}}>
        <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.md}}>
          <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
            <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
              <TouchableOpacity onPress={function(){router.back();}}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              {otherUser&&otherUser.avatar
                ? <Image source={{uri:otherUser.avatar}} style={{width:38,height:38,borderRadius:19}} />
                : <LinearGradient colors={['#F0A830','#D4821A']} style={{width:38,height:38,borderRadius:19,alignItems:'center',justifyContent:'center'}}>
                    <Text style={{fontSize:14,fontWeight:'900',color:'#fff'}}>{otherUser?otherUser.firstName[0]:''}</Text>
                  </LinearGradient>
              }
              <View style={{flex:1}}>
                <Text style={{fontSize:F.base,fontWeight:'800',color:'#fff'}}>{otherUser?otherUser.firstName+' '+otherUser.lastName:'...'}</Text>
                <Text style={{fontSize:F.xs,color:'rgba(255,255,255,0.65)'}}>{chatModule.chatStore.getState().connected?'En ligne':'Hors ligne'}</Text>
              </View>
              <TouchableOpacity onPress={function(){Alert.alert('Appel video','Bientot disponible');}} style={{marginRight:S.sm}}>
                <Ionicons name="videocam" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={function(){Alert.alert('Appel audio','Bientot disponible');}}>
                <Ionicons name="call" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {uploading&&(
          <View style={{backgroundColor:C.primaryLt,padding:S.sm,alignItems:'center'}}>
            <Text style={{fontSize:F.xs,color:C.primary,fontWeight:'700'}}>Envoi en cours...</Text>
          </View>
        )}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={function(m,i){ return m.id||String(i); }}
          renderItem={renderMessage}
          contentContainerStyle={{paddingVertical:S.lg}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{alignItems:'center',paddingVertical:60}}>
              <Text style={{fontSize:36,marginBottom:12}}>💬</Text>
              <Text style={{fontSize:F.base,color:C.muted}}>Demarrez la conversation</Text>
            </View>
          }
        />

        {showAttach&&(
          <View style={{backgroundColor:'#fff',borderTopWidth:0.5,borderTopColor:C.border,flexDirection:'row',padding:S.lg,gap:S.xl,justifyContent:'center'}}>
            <TouchableOpacity onPress={function(){pickAndUpload('image/*','image');}} style={{alignItems:'center',gap:4}}>
              <View style={{width:52,height:52,borderRadius:26,backgroundColor:'#FEF4E7',alignItems:'center',justifyContent:'center'}}>
                <Ionicons name="image" size={24} color={C.primary} />
              </View>
              <Text style={{fontSize:F.xs,color:C.muted}}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={function(){pickAndUpload('video/*','video');}} style={{alignItems:'center',gap:4}}>
              <View style={{width:52,height:52,borderRadius:26,backgroundColor:'#EBF3FF',alignItems:'center',justifyContent:'center'}}>
                <Ionicons name="videocam" size={24} color='#1A56DB' />
              </View>
              <Text style={{fontSize:F.xs,color:C.muted}}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickDocument} style={{alignItems:'center',gap:4}}>
              <View style={{width:52,height:52,borderRadius:26,backgroundColor:'#F0FFF4',alignItems:'center',justifyContent:'center'}}>
                <Ionicons name="document" size={24} color='#059669' />
              </View>
              <Text style={{fontSize:F.xs,color:C.muted}}>Fichier</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={function(){setShowAttach(false);Alert.alert('Audio','Bientot disponible');}} style={{alignItems:'center',gap:4}}>
              <View style={{width:52,height:52,borderRadius:26,backgroundColor:'#FFF0F0',alignItems:'center',justifyContent:'center'}}>
                <Ionicons name="mic" size={24} color='#DC2626' />
              </View>
              <Text style={{fontSize:F.xs,color:C.muted}}>Audio</Text>
            </TouchableOpacity>
          </View>
        )}

        <SafeAreaView edges={['bottom']} style={{backgroundColor:'#fff',borderTopWidth:0.5,borderTopColor:C.border,paddingHorizontal:S.lg,paddingVertical:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.sm}}>
            <TouchableOpacity onPress={function(){setShowAttach(function(v){return !v;});}}>
              <Ionicons name={showAttach?'close-circle':'attach'} size={24} color={C.primary} />
            </TouchableOpacity>
            <View style={{flex:1,flexDirection:'row',alignItems:'center',backgroundColor:C.bg,borderRadius:24,paddingHorizontal:S.md,paddingVertical:S.sm,borderWidth:1,borderColor:C.border}}>
              <TextInput
                style={{flex:1,fontSize:F.base,color:C.text,maxHeight:100}}
                placeholder="Ecrire un message..."
                placeholderTextColor={C.gray}
                value={msg}
                onChangeText={setMsg}
                multiline
              />
            </View>
            <TouchableOpacity onPress={handleSend} style={{width:44,height:44,borderRadius:22,backgroundColor:msg.trim()?C.primary:C.border,alignItems:'center',justifyContent:'center'}} disabled={!msg.trim()}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}