import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { Text, Button, TextInput, Icon } from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

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
    t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // Force 24-hour

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
      is24Hour: true, // 24-hour format
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
    const payload = {
      date: combinedDateTime.toISOString(),
      waterIntake: parseFloat(waterIntake) || 0,
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

      const response = await fetch('http://192.168.1.188:5276/api/Log/logHyd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('Hydration logged successfully');
        onDismiss();
      } else {
        const errorText = await response.text();
        console.error('Failed to log hydration data:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error submitting hydration data:', error);
    }
  };

  return (
    <View
      style={{
        backgroundColor: 'transparent',
      }}
    >
      <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 16 }}>
        Log Hydration
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <TextInput
          mode="flat"
          label="Date"
          value={formatDate(date)}
          onFocus={openAndroidDatePicker}
          right={<TextInput.Icon icon="calendar" />}
          style={{ flex: 0.6, marginRight: 8, backgroundColor: 'transparent' }}
        />
        <TextInput
          mode="flat"
          label="Time"
          value={formatTime(time)}
          onFocus={openAndroidTimePicker}
          right={<TextInput.Icon icon="clock-outline" />}
          style={{ flex: 0.4, backgroundColor: 'transparent' }}
        />
      </View>

      <TextInput
        mode="flat"
        label="Water Intake (ml)"
        value={waterIntake}
        onChangeText={setWaterIntake}
        keyboardType="numeric"
        style={{ marginBottom: 16, backgroundColor: 'transparent' }}
      />

      <TextInput
        mode="flat"
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={128}
        style={{ marginBottom: 16, backgroundColor: 'transparent' }}
      />

      <Button mode="contained" onPress={submitData} style={{ marginBottom: 8 }}>
        Submit
      </Button>

      <Button mode="text" onPress={onDismiss}>
        Cancel
      </Button>
    </View>
  );
};

export default HydrationForm;
