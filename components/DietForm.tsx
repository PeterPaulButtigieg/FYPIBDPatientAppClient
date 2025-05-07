import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput, HelperText, Title } from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import api from '../services/api';
import eventBus from '@/utils/eventBus';

interface DietFormProps {
  onDismiss: () => void;
}

const DietForm: React.FC<DietFormProps> = ({ onDismiss }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [foodItem, setFoodItem] = useState('');
  const [healthiness, setHealthiness] = useState(5);
  const [notes, setNotes] = useState('');

  const [foodItemError, setFoodItemError] = useState(false);

  // Format date and time strings
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
  const getCombinedDateTime = (): Date => {
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
    // Validate required field for food item.
    if (!foodItem.trim()) {
      setFoodItemError(true);
      return;
    }

    const combinedDateTime = getCombinedDateTime();

    const payload = {
      date: combinedDateTime.toISOString(),
      foodItem,
      healthiness,  // Already a number
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

      const response = await api.post('/Log/LogDiet', payload);
      if (response.status === 200 || response.status === 201) {
        console.log('Diet logged successfully:', response.data);
        onDismiss();
        eventBus.emit('refreshDashboard');
      } else {
        console.error('Failed to log diet data:', response.status, response.data);
        Alert.alert('Error', 'Failed to log diet data.');
      }
    } catch (error: any) {
      console.error('Error submitting diet data:', error);
      const errorText = error?.response?.data || 'Error submitting diet data.';
      Alert.alert('Error', errorText);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Log Diet</Title>

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
        label="Food Item*"
        value={foodItem}
        onChangeText={(text) => {
          setFoodItem(text);
          if (text.trim() !== '') setFoodItemError(false);
        }}
        style={styles.input}
        error={foodItemError}
      />
      {foodItemError && (
        <HelperText type="error">This field is required.</HelperText>
      )}

      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Healthiness: {healthiness}/10</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={healthiness}
          onSlidingComplete={(value: number) => setHealthiness(value)}
          minimumTrackTintColor="#6200ee"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#6200ee"
        />
      </View>

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
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sliderContainer: {
    marginBottom: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  button: {
    marginBottom: 8,
  },
});

export default DietForm;
