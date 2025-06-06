import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import api from '../services/api';
import eventBus from '@/utils/eventBus';

interface HydrationFormProps {
  onDismiss: () => void;
}

const HydrationForm: React.FC<HydrationFormProps> = ({ onDismiss }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [waterIntake, setWaterIntake] = useState('');
  const [notes, setNotes] = useState('');

  // Format the date and time strings
  const formatDate = (d: Date) => d.toLocaleDateString();
  const formatTime = (t: Date) =>
    t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  // Open native Android date picker
  const openAndroidDatePicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      mode: 'date',
      onChange: (_event, selectedDate) => {
        if (selectedDate) setDate(selectedDate);
      },
    });
  };

  // Open native Android time picker with 24-hour format
  const openAndroidTimePicker = () => {
    DateTimePickerAndroid.open({
      value: time,
      mode: 'time',
      is24Hour: true,
      onChange: (_event, selectedTime) => {
        if (selectedTime) setTime(selectedTime);
      },
    });
  };

  // Combine date and time into one Date object
  const getCombinedDateTime = () => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds()
    );
  };

  const submitData = async () => {
    const combinedDateTime = getCombinedDateTime();

    // Create payload—here we use toISOString() to convert to a standard format
    const payload = {
      date: combinedDateTime.toISOString(),
      waterIntake: parseFloat(waterIntake) || 0,
      notes,
    };

    try {
      // Use Axios instance from services/api.ts
      const response = await api.post('/Log/logHyd', payload);
      if (response.status === 200 || response.status === 201) {
        console.log('Hydration logged successfully:', response.data);
        onDismiss();
        eventBus.emit('refreshRecap');
      } else {
        console.error('Failed to log hydration data:', response.status, response.data);
        Alert.alert('Error', 'Failed to log hydration data.');
      }
    } catch (error: any) {
      console.error('Error submitting hydration data:', error);
      // If error.response exists, display its data; otherwise, display generic error message.
      Alert.alert('Error', error?.response?.data || 'Error submitting hydration data.');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Log Hydration
      </Text>

      <View style={styles.dateTimeRow}>
        <TextInput
          mode="flat"
          label="Date"
          value={formatDate(date)}
          onFocus={openAndroidDatePicker}
          right={<TextInput.Icon icon="calendar" />}
          style={[styles.input, { flex: 0.6, marginRight: 8 }]}
        />
        <TextInput
          mode="flat"
          label="Time"
          value={formatTime(time)}
          onFocus={openAndroidTimePicker}
          right={<TextInput.Icon icon="clock-outline" />}
          style={[styles.input, { flex: 0.4 }]}
        />
      </View>

      <TextInput
        mode="flat"
        label="Water Intake (ml)"
        value={waterIntake}
        onChangeText={setWaterIntake}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        mode="flat"
        label="Notes"
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
    padding: 20,
    backgroundColor: 'transparent',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  button: {
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

export default HydrationForm;
