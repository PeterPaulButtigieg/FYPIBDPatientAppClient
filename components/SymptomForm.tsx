import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput, HelperText, Title } from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

interface SymptomFormProps {
  onDismiss: () => void;
}

const SymptomForm: React.FC<SymptomFormProps> = ({ onDismiss }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [symptomType, setSymptomType] = useState('');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');

  const [symptomTypeError, setSymptomTypeError] = useState(false);

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

    if (!symptomType.trim()) {
        setSymptomTypeError(true);
        return;
      }

    // Create payload—here we use toISOString() to convert to a standard format
    const payload = {
      date: combinedDateTime.toISOString(),
      symptomType,
      severity,
      notes,
    };

    try {
      // Use Axios instance from services/api.ts
      const response = await api.post('/Log/logSymp', payload);
      if (response.status === 200 || response.status === 201) {
        console.log('Symptom logged successfully:', response.data);
        onDismiss();
      } else {
        console.error('Failed to log symptom data:', response.status, response.data);
        Alert.alert('Error', 'Failed to log symptom data.');
      }
    } catch (error: any) {
      console.error('Error submitting symptom data:', error);
      // If error.response exists, display its data; otherwise, display generic error message.
      Alert.alert('Error', error?.response?.data || 'Error submitting symptom data.');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Log a Symptom
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

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={symptomType}
          onValueChange={(itemValue, _itemIndex) => {
            setSymptomType(itemValue);
            if (itemValue.trim() !== '') setSymptomTypeError(false);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select a symptom..." value="" />
          <Picker.Item label="Flare Up" value="Flare Up" />
          <Picker.Item label="Abdominal Pain" value="Abdominal Pain" />
          <Picker.Item label="Visible Inflammation" value="Visible Inflammation" />
          <Picker.Item label="Fatigue" value="Fatigue" />
        </Picker>
      </View>
      {symptomTypeError && (
        <HelperText type="error">
          Please select a symptom.
        </HelperText>
      )}
        
        <Text style={styles.label}>How Severe? {severity}/10</Text>
            <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={severity}
                onSlidingComplete={setSeverity}
                minimumTrackTintColor="#6200ee"
                maximumTrackTintColor="#ccc"
                thumbTintColor="#6200ee"
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
      pickerContainer: {
        borderBottomWidth: 1,
        borderColor: 'white',
        marginBottom: 16,
      },
      picker: {
        height: 50,
        width: '100%',
        color: 'white',
      },
      label: {
        textAlign: 'center',
        marginBottom: 1,
        marginTop: 20,
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
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

export default SymptomForm;
