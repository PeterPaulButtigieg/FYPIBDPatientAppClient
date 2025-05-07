import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput, Title } from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import api from '../services/api';
import eventBus from '@/utils/eventBus';

// Define a default date representing "0:00" for a duration.
// We choose January 1, 1970 at 00:00 local time.
const defaultDuration = new Date(1970, 0, 1, 0, 0, 0);

interface LifestyleFormProps {
  onDismiss: () => void;
}

const LifestyleForm: React.FC<LifestyleFormProps> = ({ onDismiss }) => {
  const [sleepTime, setSleepTime] = useState(defaultDuration);
  const [exerciseTime, setExerciseTime] = useState(defaultDuration);
  const [stressLevel, setStressLevel] = useState(5);
  const [notes, setNotes] = useState('');

  const [date, setDate] = useState(new Date());
  const formattedTitle = `Log Lifestyle for ${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;

  // Format the duration as HH:mm string.
  const formatDuration = (d: Date) => {
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const openSleepTimePicker = () => {
    DateTimePickerAndroid.open({
      value: sleepTime,
      mode: 'time',
      is24Hour: true,
      onChange: (_event, selectedTime) => {
        if (selectedTime) setSleepTime(selectedTime);
      },
    });
  };

  const openExerciseTimePicker = () => {
    DateTimePickerAndroid.open({
      value: exerciseTime,
      mode: 'time',
      is24Hour: true,
      onChange: (_event, selectedTime) => {
        if (selectedTime) setExerciseTime(selectedTime);
      },
    });
  };

  // Example "PT2H30M" ISO 8601 duration strings.
  const buildDurationString = (d: Date): string => {
    const h = d.getHours();
    const m = d.getMinutes();
    return `PT${h}H${m}M`;
  };

  const submitData = async () => {
    const payload = {
      stressLevel,
      sleepDuration: buildDurationString(sleepTime),
      exercise: buildDurationString(exerciseTime),
      notes,
    };

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      console.log('Using token:', token);
      console.log('Payload:', payload);

      const response = await api.post('/Log/logLs', payload);
      if (response.status === 200 || response.status === 201) {
        console.log('Lifestyle logged successfully:', response.data);
        onDismiss();
        eventBus.emit('refreshDashboard');
      } else {
        console.error('Failed to log lifestyle data:', response.status, response.data);
        Alert.alert('Error', 'Failed to log lifestyle data.');
      }
    } catch (error: any) {
      console.error('Error submitting lifestyle data:', error);
      const errorText = error?.response?.data || 'Error submitting lifestyle data.';
      Alert.alert('Error', errorText);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>{formattedTitle}</Title>

      <TextInput
        mode="flat"
        label="Sleep Duration (HH:mm)"
        value={formatDuration(sleepTime)}
        onFocus={openSleepTimePicker}
        right={<TextInput.Icon icon="timer-sand" />}
        style={styles.input}
      />

      <TextInput
        mode="flat"
        label="Exercise Duration (HH:mm)"
        value={formatDuration(exerciseTime)}
        onFocus={openExerciseTimePicker}
        right={<TextInput.Icon icon="timer-sand" />}
        style={styles.input}
      />

      <Text style={styles.sliderLabel}>How was your mood today? {stressLevel}/10</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={stressLevel}
        onSlidingComplete={(val: number) => setStressLevel(val)}
        minimumTrackTintColor="#6200ee"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#6200ee"
      />

      <TextInput
        mode="flat"
        label="Notes"
        placeholder="Additional notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={128}
        style={styles.input}
      />

      <Button mode="contained" onPress={submitData} style={styles.button}>
        Submit
      </Button>

      <Button mode="text" onPress={onDismiss} style={styles.button}>
        Cancel
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sliderLabel: {
    textAlign: 'center',
    marginBottom: 1,
    marginTop:20,
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 1,
  },
  button: {
    marginBottom: 8,
  },
});

export default LifestyleForm;
