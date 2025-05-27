import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, HelperText, Title, TextInput, Switch } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import api from '../services/api';
import eventBus from '@/utils/eventBus';

interface BowelMovementFormProps {
  onDismiss: () => void;
}

const stoolTypes = [
  {
    label: 'Hard lumps, like nuts',
    value: 'Type 1',
  },
  {
    label: 'Sausage-shaped, lumpy',
    value: 'Type 2',
  },
  {
    label: 'Sausage-shaped, with cracks',
    value: 'Type 3',
  },
  {
    label: 'Sausage-shaped, smooth and soft',
    value: 'Type 4',
  },
  {
    label: 'Soft blobs with clear cut edges',
    value: 'Type 5',
  },
  {
    label: 'Fluffy pieces with ragged edges, mushy',
    value: 'Type 6',
  },
  {
    label: 'Watery, no solid pieces, entirely liquid',
    value: 'Type 7',
  },
];

const BowelMovementForm: React.FC<BowelMovementFormProps> = ({ onDismiss }) => {
  const [stoolType, setStoolType] = useState('');
  const [blood, setBlood] = useState(false);
  const [urgency, setUrgency] = useState(5);
  const [notes, setNotes] = useState('');
  const [stoolTypeError, setStoolTypeError] = useState(false);

  const submitData = async () => {
    if (!stoolType.trim()) {
      setStoolTypeError(true);
      return;
    }

    const payload = {
      stoolType,                   
      blood,                       
      urgency: urgency.toString(), 
      notes,
    };

    try {
      const response = await api.post('/Log/LogBm', payload);
      if (response.status === 200 || response.status === 201) {
        console.log('Bowel movement logged successfully:', response.data);
        onDismiss();
        eventBus.emit('reloadChart');
      } else {
        console.error('Failed to log bowel movement data:', response.status, response.data);
        Alert.alert('Error', 'Failed to log bowel movement data.');
      }
    } catch (error: any) {
      console.error('Error submitting bowel movement data:', error);
      const errorText = error?.response?.data || 'Error submitting bowel movement data.';
      Alert.alert('Error', errorText);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Log Bowel Movement</Title>
      
      {/* Picker for Stool Type */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={stoolType}
          onValueChange={(itemValue) => {
            setStoolType(itemValue);
            if (itemValue.trim() !== '') setStoolTypeError(false);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select a stool type..." value="" />
          {stoolTypes.map((stool) => (
            <Picker.Item key={stool.value} label={stool.label} value={stool.value} />
          ))}
        </Picker>
      </View>
      {stoolTypeError && (
        <HelperText type="error">Please select a stool type.</HelperText>
      )}

      {/* Switch for Blood */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Blood Present?</Text>
        <Switch value={blood} onValueChange={setBlood} />
      </View>
      
      {/* Slider for Urgency */}
      <Text style={styles.sliderLabel}>How Urgent? {urgency}/10</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={urgency}
        onSlidingComplete={(val: number) => setUrgency(val)}
        minimumTrackTintColor="#6200ee"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#6200ee"
      />

      {/* Notes Input */}
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
  pickerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    color: 'white',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 20
  },
  switchLabel: {
    fontSize: 16,
  },
  sliderLabel: {
    textAlign: 'center',
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  button: {
    marginBottom: 8,
  },
});

export default BowelMovementForm;
