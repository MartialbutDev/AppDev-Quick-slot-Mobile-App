import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from './contexts/ThemeContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      userName: 'Aligsao Gadgets',
      userAvatar: 'https://via.placeholder.com/50',
      lastMessage: 'Your rental request has been approved!',
      lastMessageTime: '10:30 AM',
      unreadCount: 2,
    },
    {
      id: '2',
      userName: 'Tech Rent PH',
      userAvatar: 'https://via.placeholder.com/50',
      lastMessage: 'When can you return the laptop?',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
    },
    {
      id: '3',
      userName: 'Gadget Hub',
      userAvatar: 'https://via.placeholder.com/50',
      lastMessage: 'Thank you for renting!',
      lastMessageTime: '2 days ago',
      unreadCount: 0,
    },
  ]);
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const handleBack = () => {
    if (selectedConversation) {
      setSelectedConversation(null);
    } else {
      router.back();
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Load messages for this conversation
    loadMessages(conversation.id);
  };

  const loadMessages = (conversationId: string) => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      setMessages([
        {
          id: '1',
          senderId: 'owner',
          senderName: selectedConversation?.userName || 'Owner',
          senderAvatar: '',
          message: 'Hello! Your rental request has been received.',
          timestamp: '10:00 AM',
          read: true,
        },
        {
          id: '2',
          senderId: 'user',
          senderName: 'You',
          senderAvatar: '',
          message: 'Great! When can I pick it up?',
          timestamp: '10:15 AM',
          read: true,
        },
        {
          id: '3',
          senderId: 'owner',
          senderName: selectedConversation?.userName || 'Owner',
          senderAvatar: '',
          message: 'You can pick it up anytime after 2 PM today.',
          timestamp: '10:30 AM',
          read: true,
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      senderName: 'You',
      senderAvatar: '',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSelectConversation(item)}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>
          {item.userName.charAt(0)}
        </Text>
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationName, { color: colors.text }]}>{item.userName}</Text>
          <Text style={[styles.conversationTime, { color: colors.textSecondary }]}>
            {item.lastMessageTime}
          </Text>
        </View>
        <View style={styles.conversationFooter}>
          <Text 
            style={[styles.lastMessage, { color: item.unreadCount > 0 ? colors.text : colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageRow,
      item.senderId === 'user' ? styles.userMessageRow : styles.ownerMessageRow
    ]}>
      {item.senderId !== 'user' && (
        <View style={[styles.messageAvatar, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.messageAvatarText, { color: colors.primary }]}>
            {selectedConversation?.userName.charAt(0)}
          </Text>
        </View>
      )}
      <View style={[
        styles.messageBubble,
        item.senderId === 'user' 
          ? [styles.userBubble, { backgroundColor: colors.primary }]
          : [styles.ownerBubble, { backgroundColor: colors.surface, borderColor: colors.border }]
      ]}>
        <Text style={[
          styles.messageText,
          { color: item.senderId === 'user' ? '#fff' : colors.text }
        ]}>
          {item.message}
        </Text>
        <Text style={[
          styles.messageTime,
          { color: item.senderId === 'user' ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
        ]}>
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  if (selectedConversation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{selectedConversation.userName}</Text>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            inverted={false}
          />
        )}

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.placeholder}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={sendMessage}
          >
            <Ionicons name="send-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        <TouchableOpacity style={styles.newMessageButton}>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conversationsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Messages Yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              When you message gadget owners, your conversations will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerInfo: { flex: 1, alignItems: 'center' },
  newMessageButton: { padding: 4 },
  callButton: { padding: 4 },
  conversationsList: { paddingVertical: 8 },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: 'bold' },
  conversationInfo: { flex: 1 },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  conversationName: { fontSize: 16, fontWeight: '600' },
  conversationTime: { fontSize: 12 },
  conversationFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { fontSize: 14, flex: 1, marginRight: 10 },
  unreadBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  unreadCount: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  messagesList: { padding: 16 },
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userMessageRow: { justifyContent: 'flex-end' },
  ownerMessageRow: { justifyContent: 'flex-start' },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageAvatarText: { fontSize: 14, fontWeight: 'bold' },
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 20 },
  userBubble: { borderBottomRightRadius: 4 },
  ownerBubble: { borderWidth: 1, borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
  },
  attachButton: { padding: 8 },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 16, textAlign: 'center', paddingHorizontal: 40 },
});