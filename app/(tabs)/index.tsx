// HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import FloatingActionButton from '@/components/FloatingActionButton';
import eventBus from '@/utils/eventBus';
import CardContent from 'react-native-paper/lib/typescript/components/Card/CardContent';

interface Prescription {
  id: number;
  patientId: string;
  medication: string;
  frequency: string;
}

interface Appointment {
  id: number;
  date: string;
  time?: string;
  venue: string;
}

const { height: windowHeight } = Dimensions.get('window');
const CARD_MARGIN = 16;

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch today's prescriptions
      const today = new Date().toISOString().split('T')[0];
      const presRes = await api.get<Prescription[]>(`/clinical/ps/date/${today}`);
      setPrescriptions(Array.isArray(presRes.data) ? presRes.data : []);

      // Fetch next appointment
      const apptRes = await api.get<Appointment[]>('/clinical/appt/f');
      if (Array.isArray(apptRes.data) && apptRes.data.length > 0) {
        const a = apptRes.data[0];
        const dt = new Date(a.date);
        const formattedDate = dt.toLocaleDateString();
        const formattedTime =
          a.time ??
          dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setNextAppt({ id: a.id, date: formattedDate, time: formattedTime, venue: a.venue });
      } else {
        setNextAppt(null);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setPrescriptions([]);
      setNextAppt(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // initial auth + load
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return router.replace('/(auth)/login');
      try {
        const { exp } = jwtDecode<{exp:number}>(token);
        if (exp < Date.now()/1000) {
          await AsyncStorage.removeItem('token');
          return router.replace('/(auth)/login');
        }
      } catch {
        await AsyncStorage.removeItem('token');
        return router.replace('/(auth)/login');
      }
      await loadDashboard();
    })();
  }, [router, loadDashboard]);

  // subscribe to global “refreshDashboard” events
  useEffect(() => {
    eventBus.addListener('refreshDashboard', loadDashboard);
    return () => { eventBus.removeListener('refreshDashboard', loadDashboard); };
  }, [loadDashboard]);

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large"/></View>;
  }

  const userName = 'UsersS';

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        {/* Greeting */}
        <Card style={[styles.card, { minHeight: windowHeight * 0.2 - CARD_MARGIN }]}>
          <Card.Content>
            <Title>Hello, {userName}!</Title>
            <Paragraph>Welcome back.</Paragraph>
          </Card.Content>
        </Card>

        {/* Prescriptions */}
        <Card style={[styles.card, { minHeight: windowHeight * 0.4 - CARD_MARGIN }]}>
          <Card.Content>
            <Title>Don't forget today's Prescriptions!</Title>
            {prescriptions.length > 0 ? (
              prescriptions.map((p) => (
                <Card key={p.id} style={styles.prescriptionItem}>
                  <Card.Content style={styles.prescriptionRow}>
                    <View style={styles.prescriptionText}>
                      <Paragraph style={styles.presName}>{p.medication}</Paragraph>
                      <Paragraph style={styles.presDesc}>{p.frequency}</Paragraph>
                    </View>
                    <IconButton
                      icon="pill"
                      size={40}
                      style={styles.presIcon}
                    />
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Paragraph>No prescriptions for today.</Paragraph>
            )}
              <Paragraph style={styles.presDesc}>
              <IconButton
                      icon="information"
                      size={16}
                      style={styles.presIcon}
                    />
                Navigate to the reminders tab to modify.
              </Paragraph>
            </Card.Content>
          </Card>


        {/* Next Appointment */}
        <Card style={[styles.card, { minHeight: windowHeight * 0.4 - CARD_MARGIN }]}>
          <Card.Content>
            <Title>Next Appointment, don't be late!</Title>
            {nextAppt ? (
              <>
                <Paragraph>Date: {nextAppt.date}</Paragraph>
                <Paragraph>Time: {nextAppt.time}</Paragraph>
                <Paragraph>Venue: {nextAppt.venue}</Paragraph>
              </>
            ) : (
              <Paragraph>No upcoming appointments. Add one in Clinical.</Paragraph>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton/>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex:1, position:'relative',},
  scroll: { flex:1 },
  container: { marginTop: 30, padding: CARD_MARGIN },
  card: { 
    width:'100%', 
    marginBottom: CARD_MARGIN 
  },

  loader: { 
    flex:1, 
    justifyContent:'center', 
    alignItems:'center' 
  },

  prescriptionItem: {
    borderWidth: 1,
    borderColor: 'gray',
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },

  prescriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  prescriptionText: {
    flex: 1,
    paddingRight: 8,
  },
  
  presIcon: {
    margin: 0,
  },
  presName: {
    fontSize: 16,
    fontWeight: '600',
  },
  presDesc: {
    fontSize: 12,
    marginTop: 4,
  },
});
