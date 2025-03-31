import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, Platform, Alert } from 'react-native';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

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

  // Format the date and time strings
  const formatDate = (d: Date) => d.toLocaleDateString();
  const formatTime = (t: Date) =>
    t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  // Open native Android date picker
  const openAndroidStartDatePicker = () => {
    DateTimePickerAndroid.open({
      value: startDate,
      mode: 'date',
      onChange: (_event, selectedDate) => {
        if (selectedDate) setStartDate(selectedDate);
      },
    });
  };

  const openAndroidEndDatePicker = () => {
    DateTimePickerAndroid.open({
      value: endDate,
      mode: 'date',
      onChange: (_event, selectedDate) => {
        if (selectedDate) setEndDate(selectedDate);
      },
    });
  };

  const submitData = async () => {
    // Validate required field for appointmentType without using an alert
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

    const payload = {
      medication,
      interval: parseInt(interval, 10) || 1 || 1,
      startDate,
      endDate,
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

      const response = await fetch('http://192.168.1.188:5276/api/Clinical/ps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('Prescription added successfully');
        onDismiss();
      } else {
        const errorText = await response.text();
        console.error('Failed to add prescription data:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error submitting prescription data:', error);
    }
  };

  return (
    <View style={{ backgroundColor: 'transparent' }}>
      <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 16 }}>
        Add Prescription
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
        style={{ marginBottom: 16, backgroundColor: 'transparent' }}
        error={medicationError}
      />
      {medicationError && (
        <HelperText type="error">
          This field is required.
        </HelperText>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <TextInput
          mode="flat"
          label="Start Date"
          value={formatDate(startDate)}
          onFocus={openAndroidStartDatePicker}
          right={<TextInput.Icon icon="calendar" />}
          style={{ flex: 0.5, marginRight: 8, backgroundColor: 'transparent' }}
        />
        <TextInput
          mode="flat"
          label="End Date"
          value={formatTime(endDate)}
          onFocus={openAndroidEndDatePicker}
          right={<TextInput.Icon icon="calendar" />}
          style={{ flex: 0.5, backgroundColor: 'transparent' }}
        />
      </View>
      {dateError && (
        <HelperText type="error">
          Start date cannot be after end date.
        </HelperText>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ textAlign: 'center',}}>
          Every...
        </Text>
        <TextInput
          mode="flat"
          label="Interval*"
          value={interval}
          onChangeText={(text) => {
              setInterval(text);
              if (text.trim() !== '') setIntervalError(false);
            }}
          multiline
          keyboardType='numeric'
          maxLength={256}
          style={{ marginBottom: 16, backgroundColor: 'transparent' }}
          error={intervalError}
        />
        <Text style={{ textAlign: 'center',}}>
         ...Day/s
        </Text>
      </View>
      {intervalError && (
          <HelperText type="error">
            This field is required.
          </HelperText>
        )}

      <TextInput
        mode="flat"
        label="Notes"
        placeholder='Eg. Take 2 after lunch...'
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

export default PrescriptionForm;
