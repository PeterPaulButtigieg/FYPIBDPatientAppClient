import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // Expect format YYYY-MM-DD
  const [mobileNumber, setMobileNumber] = useState('');

  const handleRegister = async () => {
    // Check that password and confirmPassword match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    // Prepare the data payload with property names matching your RegisterDto
    const registerData = {
      Email: email,
      Password: password,
      ConfirmPassword: confirmPassword,
      FirstName: firstName,
      LastName: lastName,
      Gender: gender,
      DateOfBirth: dateOfBirth,
      MobileNumber: mobileNumber,
    };

    try {
      await api.post('/auth/register', registerData);
      Alert.alert('Success', 'User registered successfully');
      router.replace('/(auth)/login');
    } catch (error: any) {
      console.log('Registration error:', error.response?.data || error.message);
      Alert.alert('Registration Failed', error.response?.data || 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Register</Title>
      <Text style={styles.subtitle}>Create an account to get started</Text>
      <TextInput
        mode="outlined"
        label="Email"
        placeholder="Enter your email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Confirm Password"
        placeholder="Confirm your password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="First Name"
        placeholder="Enter your first name"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Last Name"
        placeholder="Enter your last name"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Gender"
        placeholder="Enter your gender"
        value={gender}
        onChangeText={setGender}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Date of Birth"
        placeholder="YYYY-MM-DD"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Mobile Number"
        placeholder="Enter your mobile number"
        keyboardType="phone-pad"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleRegister} style={styles.button}>
        Register
      </Button>
      <Button mode="text" onPress={() => router.back()} style={styles.button}>
        <Text style={styles.subtitle}>Already have an account? | Login</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginVertical: 8,
  },
});
