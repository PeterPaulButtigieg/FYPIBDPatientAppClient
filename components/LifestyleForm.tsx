import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';

interface LifestyleFormProps {
    onDismiss: () => void;
}

const LifestyleForm: React.FC<LifestyleFormProps> = ({ onDismiss }) => {
    const [sleepHours, setSleepHours] = useState('');
    const [sleepMinutes, setSleepMinutes] = useState('');
    const [exerciseHours, setExerciseHours] = useState('');
    const [exerciseMinutes, setExerciseMinutes] = useState('');
    const [stressLevel, setStressLevel] = useState(5);
    const [notes, setNotes] = useState('');

    const submitData = async () => {
        const formattedSleepHours = sleepHours.padStart(2, '0');
        const formattedSleepMinutes = sleepMinutes.padStart(2, '0');
        const formattedExerciseHours = exerciseHours.padStart(2, '0');
        const formattedExerciseMinutes = exerciseMinutes.padStart(2, '0');

        const sleepDuration = `${formattedSleepHours}:${formattedSleepMinutes}:00`;
        const exerciseDuration = `${formattedExerciseHours}:${formattedExerciseMinutes}:00`;

        const payload = {
            stressLevel,
            sleepDuration,
            exercise: exerciseDuration, 
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
                console.log('Lifestyle logged successfully');
                onDismiss();
            } else {
                const errorText = await response.text();
                console.error('Failed to log lifestyle data:', response.status, errorText);
            }
        } catch (error) {
            console.error('Error submitting lifestyle data:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>
                Log Lifestyle
            </Text>

            {/* Sleep Duration */}
            <TextInput
                mode="flat"
                label="Sleep Hours"
                placeholder="0-24"
                value={sleepHours}
                onChangeText={setSleepHours}
                keyboardType="numeric"
                style={styles.input}
            />
            <TextInput
                mode="flat"
                label="Sleep Minutes"
                placeholder="0-60"
                value={sleepMinutes}
                onChangeText={setSleepMinutes}
                keyboardType="numeric"
                style={styles.input}
            />

            {/* Exercise Duration */}
            <TextInput
                mode="flat"
                label="Exercise Hours"
                placeholder="0-24"
                value={exerciseHours}
                onChangeText={setExerciseHours}
                keyboardType="numeric"
                style={styles.input}
            />
            <TextInput
                mode="flat"
                label="Exercise Minutes"
                placeholder="0-60"
                value={exerciseMinutes}
                onChangeText={setExerciseMinutes}
                keyboardType="numeric"
                style={styles.input}
            />

            {/* Stress Level */}
            <Text style={styles.label}>
                How stressed did you feel today? ({stressLevel})
            </Text>
            <Slider
                style={{ width: '100%', height: 40, marginBottom: 16 }}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={stressLevel}
                onValueChange={setStressLevel}
                minimumTrackTintColor="#6200ee"
                maximumTrackTintColor="#ccc"
                thumbTintColor="#6200ee"
            />

            {/* Notes */}
            <TextInput
                mode="flat"
                label="Notes"
                placeholder="Add any notes"
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
    label: {
        textAlign: 'center',
        marginBottom: 8,
    },
});

export default LifestyleForm;
