import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { setUser, setToken } = useContext(AuthContext);
  const [form, setForm] = useState({ username: '', password: '' });

  const handleLogin = async () => {
    try {
      const res = await API.post('/auth/login', form);
      setUser(res.data.user);
      setToken(res.data.token);
    } catch (err) {
      console.warn(err.response?.data?.message || 'Login error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 30, fontWeight: 'bold', color: 'blue', marginBottom: 50 }}>mbokaChats</Text>
      <Text>Login</Text>
      <TextInput placeholder="Username" style={styles.input}
        onChangeText={val => setForm({ ...form, username: val })} />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry
        onChangeText={val => setForm({ ...form, password: val })} />
      <Button title="Login" onPress={handleLogin} />
      <Text onPress={() => navigation.navigate('Signup')} style={styles.link}>Don't have an account? Sign up</Text>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundImage: 'linear-gradient(to bottom,rgb(243, 241, 241),rgb(57, 71, 146))' },
  input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
  link: { color: 'blue', marginTop: 10, fontSize: 20 }
});
