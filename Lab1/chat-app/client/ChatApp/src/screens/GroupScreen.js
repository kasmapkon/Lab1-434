import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import io from 'socket.io-client';

const GroupScreen = ({ route }) => {
  const { username } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const socket = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    socket.current = io('http://192.168.1.230:3000');
    
    socket.current.on('connect', () => {
      console.log('Connected to server:', socket.current.id);
    });
    
    socket.current.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    socket.current.emit('userJoined', { username });

    socket.current.on('messageHistory', (history) => {
      console.log('Received message history:', history);
      if (Array.isArray(history) && history.length > 0) {
        setMessages(history);
      }
    });

    socket.current.on('userJoined', (data) => {
      console.log('User joined:', data);
      if (!messages.some(msg => msg.id === data.id)) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: data.id || Date.now().toString(),
            type: 'notification',
            text: data.text || `${data.username} đã tham gia cuộc trò chuyện`,
            timestamp: data.timestamp || new Date().toISOString()
          },
        ]);
      }
    });

    socket.current.on('message', (data) => {
      console.log('Received message from server:', data);
      
      if (!messages.some(msg => msg.id === data.id)) {
        if (data.username !== username || data.type !== 'message') {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: data.id,
              text: data.text,
              username: data.username,
              timestamp: data.timestamp,
              type: data.type || 'message',
            },
          ]);
        }
      }
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [username]);

  const sendMessage = () => {
    if (messageText.trim() === '') return;

    const messageData = {
      id: Date.now().toString(),
      text: messageText,
      username,
      timestamp: new Date().toISOString(),
    };

    console.log('Sending message:', messageData);

    if (socket.current && socket.current.connected) {
      socket.current.emit('message', messageData);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...messageData,
          type: 'message',
        },
      ]);
      
      setMessageText('');
    } else {
      console.error('Socket not connected, cannot send message');
      alert('Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối!');
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === 'notification') {
      return (
        <View style={styles.notificationContainer}>
          <Text style={styles.notificationText}>{item.text}</Text>
        </View>
      );
    }

    const isMyMessage = item.username === username;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}>
        {!isMyMessage && (
          <Text style={styles.username}>{item.username}</Text>
        )}
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 12,
    color: '#666',
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    width: 60,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  notificationContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  notificationText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default GroupScreen;