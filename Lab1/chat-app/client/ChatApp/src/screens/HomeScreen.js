import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const checkUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.log('Error retrieving username:', error);
      }
    };

    checkUsername();
  }, []);

  const handleStartChat = async () => {
    if (username.trim() === '') {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      await AsyncStorage.setItem('username', username);
      navigation.navigate('Group', { username });
    } catch (error) {
      console.log('Error saving username:', error);
      Alert.alert('Error', 'Failed to save username');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your name to start chatting</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleStartChat}>
        <Text style={styles.buttonText}>Start Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;