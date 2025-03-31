import React from 'react';
import { Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Get the refresh token from AsyncStorage
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      // If a refresh token exists, call the logout endpoint to revoke it.
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API call error:', error);
      Alert.alert('Logout Error', 'There was a problem logging out on the server.');
    } finally {
      // Regardless of the API call result, clear tokens from AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      // Redirect the user to the login screen
      router.replace('/(auth)/login');
    }
  };

  return (
    <Button mode="contained" onPress={handleLogout} style={{ marginTop: 20 }}>
      Log Out
    </Button>
  );
}
