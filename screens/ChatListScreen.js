import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import API, { setAuthToken } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import moment from 'moment'; // ✅ For timestamp formatting

const socket = io('http://192.168.100.79:5000'); // replace with your local IP

const ChatListScreen = ({ navigation }) => {
  const { user, token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  // useEffect(() => {
  //   setAuthToken(token);
  //   fetchUsers();

  //   socket.emit('userOnline', user._id);
  //   socket.on('onlineUsers', (onlineIds) => {
  //     setOnlineUserIds(onlineIds);
  //   });

  //   return () => socket.disconnect();
  // }, []);
  useEffect(() => {
  console.log('User:', user);
  console.log('Token:', token);

  if (!user || !token) {
    console.warn('User or token is missing. Cannot fetch users.');
    return;
  }

  setAuthToken(token);
  fetchUsers();

  socket.emit('userOnline', user._id);
  socket.on('onlineUsers', (onlineIds) => {
    setOnlineUserIds(onlineIds);
  });

  return () => socket.disconnect();
}, []);


  const fetchUsers = async () => {
    try {
      const res = await API.get('/auth/users');
      const filtered = res.data.filter(u => u._id !== user._id);
      setUsers(filtered);
    } catch (err) {
      console.warn('Error fetching users');
    }
  };

  const renderItem = ({ item }) => {
    const isOnline = onlineUserIds.includes(item._id);
    return (
      <TouchableOpacity onPress={() => navigation.navigate('Chat', { user: item })}>
        <Text style={{ padding: 10, fontSize: 16 }}>
          {isOnline ? '🟢' : '🩸'} {item.username}
        </Text>

      </TouchableOpacity>
    );
  };

  return (
    <View style={{ padding: 20, marginLeft: 100}}>
      <Text style={{ fontSize: 30, color: 'blue', fontWeight: 'bold' }}>Chats</Text>
      <Text style={{ fontSize: 14, color: 'gray' }}>
        {moment().format('MMMM Do YYYY, h:mm:ss a')}
      </Text>
      <Text style={{ fontSize: 20, color: 'blue' }}>
        {onlineUserIds.length} users online
      </Text>
      <Text style={{ fontSize: 20, color: 'blue' }}>
        {users.length} users found
      </Text>
      <Text style={{ fontSize: 14, color: 'gray' }}>
        Last updated: {moment().format('MMMM Do YYYY, h:mm:ss a')}
      </Text>

      <FlatList style={{ marginTop: 50, backgroundColor: 'yellow' }}
        data={users}
        keyExtractor={item => item._id}
        renderItem={renderItem}
      />
    </View>
  );
};



export default ChatListScreen;
