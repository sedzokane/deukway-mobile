import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
var hooks = require('../../src/store/hooks');
var chatModule = require('../../src/store/chat');
var useAuth = hooks.useAuth;
var getToken = hooks.getToken;
var t = require('../../src/theme');
var C=t.C; var S=t.S; var R=t.R; var F=t.F;

function timeAgo(date) {
  var now = new Date();
  var d = new Date(date);
  var diff = Math.floor((now - d) / 60000);
  if (diff < 1) return 'maintenant';
  if (diff < 60) return diff + 'min';
  if (diff < 1440) return Math.floor(diff/60) + 'h';
  return Math.floor(diff/1440) + 'j';
}

function UserAvatar({ user, size }) {
  var s = size || 52;
  var r = s / 2;
  if (user && user.avatar && user.avatar.startsWith('http')) {
    return <Image source={{uri:user.avatar}} style={{width:s,height:s,borderRadius:r}} />;
  }
  return (
    <LinearGradient colors={['#F0A830','#D4821A']} style={{width:s,height:s,borderRadius:r,alignItems:'center',justifyContent:'center'}}>
      <Text style={{fontSize:s*0.34,fontWeight:'900',color:'#fff'}}>{user?user.firstName[0]:''}{user?user.lastName[0]:''}</Text>
    </LinearGradient>
  );
}

export default function Conversations() {
  var auth = useAuth(); var user = auth.user;
  var convsS = useState([]); var convs = convsS[0]; var setConvs = convsS[1];
  var refS = useState(false); var refreshing = refS[0]; var setRefreshing = refS[1];

  function load() {
    chatModule.chatStore.loadConversations(getToken()).then(function() {
      setConvs(chatModule.chatStore.getState().conversations);
    }).catch(function(){});
  }

  function onRefresh() {
    setRefreshing(true);
    chatModule.chatStore.loadConversations(getToken()).then(function() {
      setConvs(chatModule.chatStore.getState().conversations);
      setRefreshing(false);
    }).catch(function(){ setRefreshing(false); });
  }

  useEffect(function() {
    load();
    var token = getToken();
    if (!chatModule.chatStore.getState().socket && user) {
      chatModule.chatStore.connect(token, user.id);
    }
    var unsub = chatModule.chatStore.subscribe(function() {
      setConvs(chatModule.chatStore.getState().conversations.slice());
    });
    return function() { unsub(); };
  }, []);

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <LinearGradient colors={['#1A0800','#3A1800','#C8791A']} style={{paddingBottom:S.xl}}>
        <SafeAreaView edges={['top']} style={{paddingHorizontal:S.lg,paddingTop:S.sm}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:S.md}}>
            <TouchableOpacity onPress={function(){router.back();}}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={{fontSize:22,fontWeight:'900',color:'#fff'}}>Messages</Text>
              <Text style={{fontSize:F.sm,color:'rgba(255,255,255,0.65)'}}>{convs.length} conversation{convs.length>1?'s':''}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}>
        {convs.length===0&&(
          <View style={{alignItems:'center',paddingVertical:60}}>
            <Text style={{fontSize:48,marginBottom:12}}>💬</Text>
            <Text style={{fontSize:F.lg,fontWeight:'800',color:C.text}}>Aucun message</Text>
            <Text style={{fontSize:F.sm,color:C.muted,marginTop:8}}>Vos conversations apparaitront ici</Text>
          </View>
        )}
        {convs.map(function(conv){
          var u = conv.user;
          var last = conv.lastMessage;
          if (!u) return null;
          return (
            <TouchableOpacity key={u.id} style={{flexDirection:'row',alignItems:'center',gap:S.md,padding:S.lg,backgroundColor:'#fff',borderBottomWidth:0.5,borderBottomColor:C.border}} onPress={function(){router.push('/chat/'+u.id);}} activeOpacity={0.85}>
              <UserAvatar user={u} size={52} />
              <View style={{flex:1}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                  <Text style={{fontSize:F.base,fontWeight:'700',color:C.text}}>{u.firstName} {u.lastName}</Text>
                  <Text style={{fontSize:F.xs,color:C.muted}}>{timeAgo(last.createdAt)}</Text>
                </View>
                <Text style={{fontSize:F.sm,color:C.muted}} numberOfLines={1}>
                  {last.type==='image'?'📷 Photo':last.type==='file'?'📎 Fichier':last.content}
                </Text>
              </View>
              {conv.unread>0&&(
                <View style={{width:20,height:20,borderRadius:10,backgroundColor:C.primary,alignItems:'center',justifyContent:'center'}}>
                  <Text style={{fontSize:10,fontWeight:'800',color:'#fff'}}>{conv.unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}