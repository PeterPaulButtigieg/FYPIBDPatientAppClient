// ChartScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import FloatingActionButton from '@/components/FloatingActionButton';
import { LineChart } from 'react-native-gifted-charts';
import api from '@/services/api';
import eventBus from '@/utils/eventBus';

interface Recap {
  value: number;
  label: string;
}

export default function ChartScreen() {
  const { colors } = useTheme();
  const [sympData, setSympData] = useState<Recap[]>([]);
  const [bmData, setBmData]     = useState<Recap[]>([]);
  const [slData, setSlData]     = useState<Recap[]>([]);
  const [exData, setExData]     = useState<Recap[]>([]);
  const [mData, setMData]       = useState<Recap[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);

      const [resSymp, resBm, resSl, resEx, resM] = await Promise.all([
        api.get<Recap[]>('/wellness/symp/recap'),
        api.get<Recap[]>('/wellness/bm/recap'),
        api.get<Recap[]>('/wellness/ls/slrecap'),
        api.get<Recap[]>('/wellness/ls/exrecap'),
        api.get<Recap[]>('/wellness/ls/mrecap'),
      ]);

      if (!Array.isArray(resSymp.data)) throw new Error('symp bad');
      if (!Array.isArray(resBm.data))   throw new Error('bm bad');
      if (!Array.isArray(resSl.data))   throw new Error('sleep bad');
      if (!Array.isArray(resEx.data))   throw new Error('exercise bad');
      if (!Array.isArray(resM.data))    throw new Error('mood bad');

      setSympData(resSymp.data);
      setBmData(resBm.data);
      setSlData(resSl.data);
      setExData(resEx.data);
      setMData(resM.data);
      setError(null);

    } catch (err) {
      console.error(err);
      setError('Failed to load chart data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChartData();
    const handler = () => fetchChartData();
    eventBus.on('reloadChart', handler);
    return () => { eventBus.off('reloadChart', handler); };
  }, [fetchChartData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: colors.error }}>{error}</Text>
      </SafeAreaView>
    );
  }

  // Legend configuration
  const legendItems = [
    { label: 'Symptoms',       color: 'tomato'   },
    { label: 'Bowel Movement', color: 'gold'     },
    { label: 'Sleep (h)',      color: 'plum'     },
    { label: 'Exercise (h)',   color: 'skyblue'  },
    { label: 'Stress Level',   color: 'palegreen'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        

        {/* Combined LineChart with multiple data sets */}
        <LineChart
          data={sympData}
          data2={bmData}
          data3={slData}
          data4={exData}
          data5={mData}
          hideDataPoints
          thickness={2}
          spacing={40}
          hideRules
          color1='tomato'
          color2='gold'
          color3='plum'
          color4='skyblue'
          color5='palegreen'
          hideYAxisText={false}
          noOfSections={10}
          xAxisLabelTextStyle={{ color: '#fff', fontSize: 10 }}
          yAxisTextStyle={{ color: '#fff', fontSize: 10 }}
          yAxisColor="#fff"
          xAxisColor="#fff"
          verticalLinesColor="rgba(255,255,255,0.2)"
          color="#fff"
        />

        {/* Legend */}
        <View style={styles.legendContainer}>
          {legendItems.map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
      <FloatingActionButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1},
  scroll:    { padding: 16 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },

  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    marginRight: 4,
    borderRadius: 2,
  },
  legendLabel: {
    color: '#fff',
    fontSize: 12,
  },
});
