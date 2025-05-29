import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import api from '../services/api';
import eventBus from '@/utils/eventBus';

interface AppointmentFormProps {
  onDismiss: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onDismiss }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [appointmentType, setAppointmentType] = useState('');
  const [venue, setVenue] = useState('');
  const [notes, setNotes] = useState('');
  const [appointmentTypeError, setAppointmentTypeError] = useState(false);
  const [venueError, setVenueError] = useState(false);

  // Format the date and time
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

  // Open native Android time picker
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

  // Combine date and time into a single Date
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
    // Validate required field for appointmentType
    if (!appointmentType.trim()) {
      setAppointmentTypeError(true);
      return;
    }

    if (!venue.trim()) {
      setVenueError(true);
      return;
    }

    const combinedDateTime = getCombinedDateTime();
    const now = new Date();

    if (combinedDateTime < now) {
      Alert.alert('Invalid Date', 'An appointment cannot be in the past.');
      return;
    }

    // Prepare payload by sending date as ISO string
    const payload = {
      date: combinedDateTime.toISOString(),
      appointmentType,
      venue,
      notes,
    };

    try {
      const response = await api.post('/Clinical/appt', payload);
      console.log('Appointment added successfully:', response.data);
      onDismiss();
      eventBus.emit('refreshDashboard');
      eventBus.emit('refreshReminders');
    } catch (error: any) {
      if (error.response) {
        const errorText = await error.response.data;
        console.error('Failed to add appointment data:', error.response.status, errorText);
        Alert.alert('Error', errorText || 'Failed to add appointment data.');
      } else {
        console.error('Error submitting appointment data:', error);
        Alert.alert('Error', 'Error submitting appointment data.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Add Appointment
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
        label="Description*"
        value={appointmentType}
        onChangeText={(text) => {
          setAppointmentType(text);
          if (text.trim() !== '') setAppointmentTypeError(false);
        }}
        multiline
        maxLength={128}
        style={styles.input}
        error={appointmentTypeError}
      />
      {appointmentTypeError && (
        <HelperText type="error">This field is required.</HelperText>
      )}

      <TextInput
        mode="flat"
        label="Venue*"
        value={venue}
        onChangeText={(text) => {
          setVenue(text);
          if (text.trim() !== '') setVenueError(false);
        }}
        multiline
        maxLength={256}
        style={styles.input}
        error={venueError}
      />
      {venueError && (
        <HelperText type="error">This field is required.</HelperText>
      )}

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

export default AppointmentForm;
