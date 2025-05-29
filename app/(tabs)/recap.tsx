// Recap.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, ActivityIndicator, Alert, Text } from 'react-native';
import { Card, Title, Paragraph, IconButton, useTheme, Divider } from 'react-native-paper';
import FloatingActionButton from '@/components/FloatingActionButton';
import ChartScreen from '@/components/ChartScreen';
import { PieChart } from 'react-native-gifted-charts';
import api from '@/services/api';
import eventBus from '@/utils/eventBus';

interface Meal {
  id: number;
  patientId: string;
  date: string; 
  foodItem: string;
  notes: string;
}

interface HydrationRecap {
  todayIntake: number;     
  pastSixDaysIntake: number;
}

export default function RecapScreen() {
  const { colors } = useTheme();

  // ─── Meals state ─────────────────────────────────────────────────────────────
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [mealsError, setMealsError] = useState<string | null>(null);

  const loadRecap = useCallback(async () => {
    setLoadingMeals(true);
    setMealsError(null);
    try {
      const res = await api.get<Meal[]>('/wellness/diet/recap');
      const all = Array.isArray(res.data) ? res.data : [];

      setMeals(all);
    } catch (e) {
      console.error(e);
      setMealsError('Could not load meals.');
    } finally {
      setLoadingMeals(false);
    }
  }, []);

  const handleDelete = useCallback((id: number) => {
    Alert.alert(
      'Delete meal?',
      'Are you sure you want to delete this meal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/wellness/diet/${id}`);
              setMeals(prev => prev.filter(m => m.id !== id));
            } catch (e) {
              console.error('Delete failed', e);
              Alert.alert('Error', 'Could not delete meal.');
            }
          },
        },
      ]
    );
  }, []);

  // ─── Hydration state ───────────────────────────────────────────────────────────
  const [hydrSlices, setHydrSlices] = useState<{ value: number; color: string }[]>([]);
  const [hydrLoading, setHydrLoading] = useState(true);
  const [hydrError, setHydrError] = useState<string | null>(null);

  const loadHydrationRecap = useCallback(async () => {
    setHydrLoading(true);
    setHydrError(null);
    try {
      const res = await api.get<HydrationRecap>('/wellness/hyd/recap');
      const { todayIntake, pastSixDaysIntake } = res.data;
      const idealIntake = Math.max(
        14000 - (todayIntake + pastSixDaysIntake),
        0
      );
      
      setHydrSlices([
        { value: todayIntake, color: 'gold'},
        { value: pastSixDaysIntake, color: '#4f398b' },
        { value: idealIntake, color: '#7d7d7c'}
      ]);
    } catch (e) {
      console.error(e);
      setHydrError('Could not load hydration data.');
    } finally {
      setHydrLoading(false);
    }
  }, [colors]);

  // ─── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadRecap();
    loadHydrationRecap();
  }, [loadRecap, loadHydrationRecap]);

  useEffect(() => {
    const refreshAll = () => {
      loadRecap();
      loadHydrationRecap();
    };
    eventBus.addListener('refreshRecap', refreshAll);
    return () => {
      eventBus.removeListener('refreshRecap', refreshAll);
    };
  }, [loadRecap, loadHydrationRecap]);

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

        {/* 7-Day Symptom Recap Chart */}
        <Card style={styles.Card}>
          <Card.Content>
            <Title style={styles.CardTitle}>Lifestyle Metrics</Title>
            <Divider style={styles.Divider}/>
            <ChartScreen />
          </Card.Content>
        </Card>

        {/* Hydration Donut Chart */}
        <Card style={styles.Card}>
          <Card.Content>
              <Title style={styles.CardTitle}>Last Seven days of Hydration</Title>
              <Divider style={styles.Divider}/>
              {hydrLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : hydrError ? (
                <Text style={{ color: colors.error }}>{hydrError}</Text>
              ) : (
                <View style={styles.hydrationContainer}>
                  <View>
                    <Paragraph style={styles.AttentionText}>
                      {((hydrSlices[0].value+hydrSlices[1].value)/1000).toFixed(1)} L
                    </Paragraph>
                        <Paragraph style={styles.CardItemName}>
                          <IconButton icon="circle" size={16} iconColor='gold'/>
                            Today {((hydrSlices[0].value)/1000).toFixed(1)} L
                        </Paragraph>
                        <Paragraph style={styles.CardItemName}>
                        <IconButton icon="circle" size={16} iconColor='#4f398b'/>
                          Daily Avg. {((hydrSlices[1].value/6)/1000).toFixed(1)} L
                        </Paragraph>
                  </View>
                  <View style={styles.hydChartContainer}>
                    <PieChart
                      data={hydrSlices}
                      donut
                      radius={75}        
                      innerRadius={45} 
                      showText={false}
                      centerLabelComponent={() => {
                        return <Text style={{fontSize: 30, fontWeight: '600', color:'white'}}>
                          {(((hydrSlices[0].value+hydrSlices[1].value)/14000)*100).toFixed(0)}%
                        </Text>;}}
                      innerCircleColor="#242228"
                    />
                  </View>
                </View>
              )}
              <View style={styles.InfoRow}>
                <IconButton icon="information" size={16} style={styles.Icon} />
                <Paragraph style={styles.InfoText}>
                  Percentage follows the 2 L/day hydration guideline, always consult your doctor's reccomendations.
                </Paragraph>
            </View>
          </Card.Content>
        </Card>

        {/* Meals in the Last 7 Days */}
        <Card style={styles.Card}>
          <Card.Content>
            <Title style={styles.CardTitle}>Last Seven Days in Meals</Title>
            <Divider style={styles.Divider}/>
            {loadingMeals ? (
              <ActivityIndicator color={colors.primary} />
            ) : mealsError ? (
              <Text style={{ color: colors.error }}>{mealsError}</Text>
            ) : meals.length > 0 ? (
              meals.map(m => {
                const dt = new Date(m.date);
                const dateStr = dt.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });
                const timeStr = dt.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <Card key={m.id} style={styles.CardItem}>
                    <Card.Content style={styles.CardItemRow}>
                      <View style={styles.CardText}>
                        <Paragraph style={styles.CardItemName}>
                          {m.foodItem}
                        </Paragraph>
                        <Paragraph style={styles.CardItemDesc}>
                          {dateStr} at {timeStr}
                        </Paragraph>
                        {m.notes ? (
                          <Paragraph style={styles.CardItemDesc}>
                            Notes: {m.notes}
                          </Paragraph>
                        ) : null}
                      </View>
                      <View style={styles.IconRow}>
                        <IconButton
                          icon="delete-outline"
                          size={28}
                          onPress={() => handleDelete(m.id)}
                        />
                      </View>
                    </Card.Content>
                  </Card>
                );
              })
            ) : (
              <Paragraph>No meals logged.</Paragraph>
            )}
            <View style={styles.InfoRow}>
              <IconButton icon="information" size={16} style={styles.Icon} />
              <Paragraph style={styles.InfoText}>
                Earlier meals have been archived.
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

      </ScrollView>

      <FloatingActionButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, position: 'relative' },
  scroll: { flex: 1 },
  container: { marginTop: 30, padding: 16 },

  Card: { marginBottom: 16, borderRadius: 12, elevation: 4 },
  CardTitle: { fontSize: 22, fontWeight: '600', marginBottom: 12 },

  CardItem: {
    borderWidth: 1,
    borderColor: 'gray',
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  CardItemRow: { flexDirection: 'row', alignItems: 'center' },
  CardText: { flex: 1, paddingRight: 8 },
  CardItemName: { fontSize: 16, fontWeight: '600' },
  CardItemDesc: { fontSize: 12, marginTop: 4 },

  Icon: { margin: 0 },
  IconRow: { flexDirection: 'row', alignItems: 'center' },

  InfoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  InfoText: { fontSize: 12 },

  hydrationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  hydChartContainer: {
    width: 150,     // must match widthAndHeight on the chart
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },

  AttentionText: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 50,
  },

  Divider: {
    marginBottom: 16,
    borderWidth: 0.75,
    borderColor: 'gray',
  }
});
