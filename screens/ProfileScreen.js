import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, Button, StyleSheet, TextInput, Image, TouchableOpacity
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import API, { setAuthToken } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
  const { user, setUser, token, setToken } = useContext(AuthContext);
  const [form, setForm] = useState({ username: '', email: '' });
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    setForm({ username: user.username, email: user.email });
    setAvatar(user.avatar);
  }, [user]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: false,
      allowsEditing: true,
    });

    if (!result.cancelled) {
      setAvatar(result.uri);
    }
  };

  const handleUpdate = async () => {
    try {
      const data = new FormData();
      data.append('username', form.username);
      data.append('email', form.email);
      if (avatar && !avatar.startsWith('http')) {
        data.append('avatar', {
          uri: avatar,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        });
      }

      setAuthToken(token);
      const res = await API.put('/auth/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(res.data);
      alert('Profile updated!');
    } catch (err) {
      console.warn(err.response?.data || 'Update error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            avatar
              ? { uri: avatar.startsWith('http') ? `http://192.168.56.1:5000${avatar}` : avatar }
              : require('../assets/default-avatar.png') // fallback
          }
          style={styles.avatar}
        />
        <Text style={styles.changeText}>Tap to change photo</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={form.username}
        onChangeText={val => setForm({ ...form, username: val })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={val => setForm({ ...form, email: val })}
      />

      <Button title="Update Profile" onPress={handleUpdate} />
      <View style={{ marginTop: 20 }}>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  changeText: { fontSize: 14, color: 'blue', marginBottom: 20 },
  input: { width: '100%', borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
});
