import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import api from '../services/api';
import eventBus from '@/utils/eventBus';

interface PrescriptionFormProps {
  onDismiss: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ onDismiss }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [interval, setInterval] = useState('');
  const [medication, setMedication] = useState('');
  const [notes, setNotes] = useState('');
  const [medicationError, setMedicationError] = useState(false);
  const [intervalError, setIntervalError] = useState(false);
  const [dateError, setDateError] = useState(false);

  // Format date as a localized string
  const formatDate = (d: Date) => d.toLocaleDateString();

  // Open the native Android date picker for start date
  const openAndroidStartDatePicker = () => {
    DateTimePickerAndroid.open({
      value: startDate,
      mode: 'date',
      onChange: (_event, selectedDate) => {
        if (selectedDate) {
          setStartDate(selectedDate);
        }
      },
    });
  };

  // Open the native Android date picker for end date
  const openAndroidEndDatePicker = () => {
    DateTimePickerAndroid.open({
      value: endDate,
      mode: 'date',
      onChange: (_event, selectedDate) => {
        if (selectedDate) {
          setEndDate(selectedDate);
        }
      },
    });
  };

  // Combine start date and end date are already separate; we'll send ISO strings.
  const submitData = async () => {
    // Validate required fields.
    if (!medication.trim()) {
      setMedicationError(true);
      return;
    }

    if (!interval || parseInt(interval, 10) < 1) {
      setIntervalError(true);
      return;
    }

    if (endDate < startDate) {
      setDateError(true);
      return;
    }

    // Construct payload. Convert dates to ISO strings.
    const payload = {
      medication,
      interval: parseInt(interval, 10),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      notes, // no frequency field any longer
    };

    try {
      // Use Axios instance that has the base URL set and token interceptor (if configured)
      const response = await api.post('/Clinical/ps', payload);

      // Axios sets response.status to a number – you can check for 200/201
      if (response.status === 200 || response.status === 201) {
        console.log('Prescription added successfully:', response.data);
        onDismiss();
        eventBus.emit('refreshDashboard');

      } else {
        console.error('Failed to add prescription data:', response.status, response.data);
        Alert.alert('Error', 'Failed to add prescription data.');
      }
    } catch (error: any) {
      console.error('Error submitting prescription data:', error);
      // If error.response exists, display its data; otherwise, display a generic error message.
      const errorText = error?.response?.data || 'Error submitting prescription data.';
      Alert.alert('Error', errorText);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Add Prescription Reminder
      </Text>

      <TextInput
        mode="flat"
        label="Medication*"
        value={medication}
        onChangeText={(text) => {
          setMedication(text);
          if (text.trim() !== '') setMedicationError(false);
        }}
        multiline
        maxLength={128}
        style={styles.input}
        error={medicationError}
      />
      {medicationError && (
        <HelperText type="error">This field is required.</HelperText>
      )}

      <View style={styles.dateRow}>
        <TextInput
          mode="flat"
          label="Start Date"
          value={formatDate(startDate)}
          onFocus={openAndroidStartDatePicker}
          right={<TextInput.Icon icon="calendar" />}
          style={[styles.input, { flex: 0.5, marginRight: 8 }]}
        />
        <TextInput
          mode="flat"
          label="End Date"
          value={formatDate(endDate)}
          onFocus={openAndroidEndDatePicker}
          right={<TextInput.Icon icon="calendar" />}
          style={[styles.input, { flex: 0.5 }]}
        />
      </View>
      {dateError && (
        <HelperText type="error">Start date cannot be after end date.</HelperText>
      )}

      <View style={styles.intervalRow}>
        <Text style={styles.intervalLabel}>Every</Text>
        <TextInput
          mode="flat"
          label=""
          value={interval}
          onChangeText={(text) => {
            setInterval(text);
            if (text.trim() !== '') setIntervalError(false);
          }}
          keyboardType="numeric"
          style={[styles.input, { flex: 0.3 }]}
          error={intervalError}
        />
        <Text style={styles.intervalLabel}>Day/s</Text>
      </View>
      {intervalError && (
        <HelperText type="error">This field is required.</HelperText>
      )}

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
  button: {
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  intervalLabel: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default PrescriptionForm;
