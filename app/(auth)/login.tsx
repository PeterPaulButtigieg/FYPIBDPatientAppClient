import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await api.post('/Auth/login', { email, password });
      // Destructure the response to get accessToken and refreshToken.
      const { accessToken, refreshToken } = response.data;
      
      if (!accessToken || !refreshToken) {
        throw new Error('Tokens not received');
      }

      // Store both tokens in AsyncStorage.
      await AsyncStorage.setItem('token', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('ERROR: ', error);
      Alert.alert('Login Failed', error?.response?.data || 'Check your credentials');
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Login</Title>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      <TextInput
        mode="outlined"
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        mode="outlined"
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Log In
      </Button>
      <Button mode="text" onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.subtitle}>Don't have an account? | Register</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 12,
  },
});
