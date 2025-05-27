// HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  IconButton,
  Icon,
  useTheme,
  Divider
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import FloatingActionButton from '@/components/FloatingActionButton';
import eventBus from '@/utils/eventBus';
import { MaterialIcons } from '@expo/vector-icons';

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
  appointmentType: string;
  notes: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
        const formattedTime = a.time 
          ? a.time 
          : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          a.time ??
          dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setNextAppt({
            id: a.id,
            date: a.date,               
            time: formattedTime,
            venue: a.venue,
            appointmentType: a.appointmentType,
            notes: a.notes,
        });
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
        const { exp } = jwtDecode<{ exp: number }>(token);
        if (exp < Date.now() / 1000) {
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
    return () => {
      eventBus.removeListener('refreshDashboard', loadDashboard);
    };
  }, [loadDashboard]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const userName = 'DemoUser';

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        {/* Greeting */}
        <Card style={[styles.Card]}>
          <Card.Content>
            <View style={styles.CardTitleRow}>
              <IconButton icon="hand-wave" size={24} style={styles.Icon} />
              <Title style={styles.CardTitle}>Greetiings, {userName}</Title>
            </View>
            <Paragraph style={styles.CardText}>You’ve got this. Keeping a daily log helps your doctor spot patterns and stay in control of your health. Goodluck on your IBD journey!</Paragraph>
          </Card.Content>
        </Card>

        {/* Prescriptions */}
        <Card style={[styles.Card]}>
          <Card.Content>
          <View style={styles.CardTitleRow}>
            <Title style={styles.CardTitle}>Today's Prescriptions</Title>
          </View>
            {prescriptions.length > 0 ? (
              prescriptions.map((p) => (
                <Card key={p.id} style={styles.CardItem}>
                  <Card.Content style={styles.CardItemRow}>
                    <View style={styles.CardText}>
                      <Paragraph style={styles.CardItemName}>{p.medication}</Paragraph>
                      <Paragraph style={styles.CardItemDesc}>{p.frequency}</Paragraph>
                    </View>
                    <IconButton icon="pill" size={32} style={styles.Icon} />
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Paragraph style={styles.CardText}>No prescriptions for today.</Paragraph>
            )}
            <View style={styles.InfoRow}>
              <IconButton icon="information" size={16} style={styles.Icon} />
              <Paragraph style={styles.InfoText}>
                Navigate to the reminders tab to modify.
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        {/* Next Appointment */}
      <Card style={[styles.Card]}>
        <Card.Content>
          <View style={styles.CardTitleRow}>
            <Title style={styles.CardTitle}>Next Appointment</Title>
          </View>

          {nextAppt ? (
            <>
              {/* big date */}
              <View style={styles.dateRow}>
                <Paragraph style={styles.dateNumber}>
                  {new Date(nextAppt.date).getDate()}
                </Paragraph>
                <Paragraph style={styles.dateMonth}>
                  {new Date(nextAppt.date).toLocaleString('default', { month: 'short' })}
                </Paragraph>
              </View>

              <Divider style={styles.divider} />

              {/* appointment details */}
              <Card style={styles.CardItem}>
                  <Card.Content style={styles.CardItemRow}>
                    <View style={styles.CardText}>
                      <Paragraph style={styles.CardItemName}>{nextAppt.appointmentType}</Paragraph>
                      <Paragraph style={styles.CardItemDesc}>{nextAppt.time}</Paragraph>
                      <Paragraph style={styles.CardItemDesc}>{nextAppt.venue}</Paragraph>
                      <Paragraph style={styles.CardItemDesc}>{nextAppt.notes}</Paragraph>
                    </View>
                    <IconButton icon="calendar-star" size={32} style={styles.Icon} />
                  </Card.Content>
                </Card>
            </>
          ) : (
            <Paragraph>No upcoming appointments. Add one in Clinical.</Paragraph>
          )}
          <View style={styles.InfoRow}>
              <IconButton icon="information" size={16} style={styles.Icon} />
              <Paragraph style={styles.InfoText}>
                Navigate to the reminders tab to modify.
              </Paragraph>
          </View>
        </Card.Content>
      </Card>

      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    position: 'relative' 
  },

  scroll: { 
    flex: 1 
  },
  container: { 
    marginTop: 30, 
    padding: 16,
  },
  
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  Card: { 
    width: '100%', 
    marginBottom: 16, 
    borderRadius: 12, 
    elevation: 4,
  },

  CardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  CardTitle: {
    marginLeft: 8,
    fontSize: 22,
    fontWeight: '600',
  },

  CardText: {
    marginLeft: 8,
    flex: 1,
    paddingRight: 8,
  },
  
  CardItem: {
    borderWidth: 1,
    borderColor: 'gray',
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },

  CardItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  CardItemName: {
    fontSize: 16,
    fontWeight: '600',
  },

  CardItemDesc: {
    fontSize: 12,
    marginTop: 4,
  },

  Icon: {
    margin: 0,
  },

  InfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  InfoText: {
    fontSize: 12,
  },

  
  

  // --- APPOINTMENT REMINDER START --- not universal styles.
  dateRow: {
    flexDirection: 'row',
    alignItems: 'baseline', 
    justifyContent: 'center',
    marginVertical: 12,     
  },
  dateNumber: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  dateMonth: {
    fontSize: 24,
    marginLeft: 8,
    lineHeight: 32,            
  },

  divider: {
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'gray',
  },
  // --- APPOINTMENT REMINDER END --- 
  
});
