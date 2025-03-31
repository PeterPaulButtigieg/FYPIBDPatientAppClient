import { Image, StyleSheet, Platform } from 'react-native';
import { ActivityIndicator, View } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


import FloatingActionButton from '@/components/FloatingActionButton';

interface JWTPayload {
  exp: number; 
}

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          const currentTime = Date.now() / 1000; // current time in seconds

          if (decoded.exp < currentTime) {
            // Token expired, so remove it and navigate to login.
            await AsyncStorage.removeItem('token');
            router.replace('/(auth)/login');
          } else {
            // Token is valid.
            router.replace('/(tabs)');
          }
        } catch (error) {
          // Token invalid or decoding failed.
          await AsyncStorage.removeItem('token');
          router.replace('/(auth)/login');
        }
      } else {
        router.replace('/(auth)/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <FloatingActionButton style={styles.fab} />
    </ThemedView>
  );
    

}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 20,
  },
});
