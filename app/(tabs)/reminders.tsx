// Reminders.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, ActivityIndicator, Alert, Text } from 'react-native';
import { Card, Title, Paragraph, IconButton, useTheme, Divider } from 'react-native-paper';
import FloatingActionButton from '@/components/FloatingActionButton';
import ChartScreen from '@/components/ChartScreen';
import { PieChart } from 'react-native-gifted-charts';
import api from '@/services/api';
import eventBus from '@/utils/eventBus';

interface Prescription {
    id: number;
    patientId: string;
    medication: string;
    interval: number;
    endDate: string;
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

export default function TabFourScreen() {
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

        const loadReminders = useCallback(async () => {
            setLoading(true);
            try {
              const presRes = await api.get<Prescription[]>('/clinical/ps/c');
              setPrescriptions(Array.isArray(presRes.data) ? presRes.data : []);

              const apptRes = await api.get<Appointment[]>('/clinical/appt/f');
              
              const formattedAppointments: Appointment[] = Array.isArray(apptRes.data)
                ? apptRes.data.map((appt) => {
                    const dt = new Date(appt.date);
                    const date = dt.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    }); // "30 May 2025"
                    const time = dt.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    }); // "5:18 PM"
                    return { ...appt, date, time };
                  })
                : [];

              setAppointments(formattedAppointments);
            }
            catch (err) {
              console.error('Error loading dashboard:', err);
              setPrescriptions([]);
              setAppointments([]);
            } finally {
              setLoading(false);
            }
        }, []);

        const handlePresDelete = useCallback((id: number) => {
          Alert.alert(
            'Delete prescription?',
            'Are you sure you want to delete this prescription reminder?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await api.delete(`/clinical/ps/${id}`);
                    setPrescriptions(prev => prev.filter(p => p.id !== id));
                    eventBus.emit('refreshDashboard');
                  } catch (e) {
                    console.error('Delete failed', e);
                    Alert.alert('Error', 'Could not delete prescription.');
                  }
                },
              },
            ]
          );
        }, []);

        const handleApptDelete = useCallback((id: number) => {
          Alert.alert(
            'Delete appointment?',
            'Are you sure you want to delete this appointment reminder?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await api.delete(`/clinical/appt/${id}`);
                    setAppointments(prev => prev.filter(a => a.id !== id));
                    eventBus.emit('refreshDashboard');
                  } catch (e) {
                    console.error('Delete failed', e);
                    Alert.alert('Error', 'Could not delete appointments.');
                  }
                },
              },
            ]
          );
        }, []);
        
        useEffect(() => {
          loadReminders();
        }, [loadReminders]);

        useEffect(() => {
          const refreshAll = () => {
            loadReminders();
          };
          eventBus.addListener('refreshReminders', refreshAll);
          return () => {
            eventBus.removeListener('refreshReminders', refreshAll);
          };
        }, [loadReminders]);

        return (
          <View style={styles.root}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
              <Card style={[styles.Card]}>
                <Card.Content>
                  <View style={styles.CardTitleRow}>
                    <Title style={styles.CardTitle}>Current Prescriptions</Title>
                  </View>
                  <Divider style={styles.Divider}/>
                    {prescriptions.length > 0 ? (
                    prescriptions.map((p) => (
                      <Card key={p.id} style={styles.CardItem}>
                        <Card.Content style={styles.CardItemRow}>
                          <View style={styles.CardText}>
                            <Paragraph style={styles.CardItemName}>{p.medication}</Paragraph>
                            <Paragraph style={styles.CardItemDesc}>Every {p.interval} days</Paragraph>
                            <Paragraph style={styles.CardItemDesc}>{p.frequency}</Paragraph>
                          </View>
                          <IconButton
                              icon="delete-outline"
                              size={28}
                              onPress={() => handlePresDelete(p.id)}
                            />
                        </Card.Content>
                      </Card>
                    ))
                  ) : (
                    <Paragraph style={styles.CardText}>No ongoing prescriptions.</Paragraph>
                  )}
                  <View style={styles.InfoRow}>
                    <IconButton icon="information" size={16} style={styles.Icon} />
                    <Paragraph style={styles.InfoText}>
                      Past Prescriptions have been archived.
                    </Paragraph>
                </View>
                </Card.Content>
              </Card>
              <Card style={[styles.Card]}>
                <Card.Content>
                  <View style={styles.CardTitleRow}>
                    <Title style={styles.CardTitle}>Upcoming Appointments</Title>
                  </View>
                  <Divider style={styles.Divider}/>
                    {appointments.length > 0 ? (
                    appointments.map((a) => (
                      <Card key={a.id} style={styles.CardItem}>
                        <Card.Content style={styles.CardItemRow}>
                          <View style={styles.CardText}>
                            <Paragraph style={styles.CardItemName}>{a.appointmentType}</Paragraph>
                            <Paragraph style={styles.CardItemDesc}>{a.date} at {a.time}</Paragraph>
                            <Paragraph style={styles.CardItemDesc}>{a.venue}</Paragraph>
                            <Paragraph style={styles.CardItemDesc}>{a.notes}</Paragraph>
                          </View>
                            <IconButton
                              icon="delete-outline"
                              size={28}
                              onPress={() => handleApptDelete(a.id)}
                            />
                        </Card.Content>
                      </Card>
                    ))
                  ) : (
                    <Paragraph style={styles.CardText}>No upcoming appointments.</Paragraph>
                  )}
                  <View style={styles.InfoRow}>
                    <IconButton icon="information" size={16} style={styles.Icon} />
                    <Paragraph style={styles.InfoText}>
                      Past Appointments have been archived.
                    </Paragraph>
                </View>
                </Card.Content>
              </Card>
            </ScrollView>
          </View>
        )
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

  Divider: {
    marginBottom: 16,
    borderWidth: 0.75,
    borderColor: 'gray',
  }
});
