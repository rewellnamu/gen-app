import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import API, { setAuthToken } from '../services/api';
import io from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';

const socket = io('http://192.168.100.79:5000'); // 🔁 Replace with your local IP if different

const ChatScreen = ({ route }) => {
  const { user, token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [receiverData, setReceiverData] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const receiver = route.params.user;

  useEffect(() => {
    setAuthToken(token);

    socket.emit('userOnline', user._id);

    socket.on('receiveMessage', (msg) => {
      if (msg.sender._id === receiver._id || msg.receiver === receiver._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on('onlineUsers', (ids) => setOnlineUserIds(ids));

    fetchMessages();
    fetchReceiver();

    return () => socket.disconnect();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/chat/messages/${receiver._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  const fetchReceiver = async () => {
    try {
      const res = await API.get(`/auth/user/${receiver._id}`);
      setReceiverData(res.data);
    } catch (err) {
      console.error('Error fetching user data', err);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const res = await API.post('/chat/send', {
        receiver: receiver._id,
        text,
      });
      socket.emit('sendMessage', res.data);
      setMessages((prev) => [...prev, res.data]);
      setText('');
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  const sendImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  });

  if (!result.cancelled) {
    const localUri = result.assets[0]?.uri || result.uri;
    const filename = localUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    const form = new FormData();
    form.append('receiver', receiver._id);
    form.append('image', {
      uri: localUri,
      name: filename,
      type,
    });

    try {
      const res = await API.post('/chat/send', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Image message sent:', res.data); // ✅ Debug
      socket.emit('sendMessage', res.data);
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Image send error', err.response?.data || err.message);
    }
  }
};


  const renderItem = ({ item }) => {
    const isSelf = item.sender._id === user._id;

    return (
      <View style={[styles.row, isSelf ? styles.selfRow : styles.otherRow]}>
        {!isSelf && (
          <Image
            source={{
              uri: `http://192.168.100.79:5000${item.sender.avatar || ''}`,
            }}
            style={styles.avatar}
          />
        )}
        <View style={[styles.bubble, isSelf ? styles.self : styles.other]}>
          {item.text ? <Text>{item.text}</Text> : null}
          {item.image && (
            <Image
              source={{ uri: `http://192.168.100.79:5000${item.image}` }}
              style={styles.image}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header Info */}
      {receiverData && (
        <View style={styles.header}>
          <Text style={styles.username}>{receiverData.username}</Text>
          <Text style={styles.status}>
            {onlineUserIds.includes(receiver._id)
              ? 'Online'
              : `Last seen: ${new Date(receiverData.lastSeen).toLocaleString()}`}
          </Text>
        </View>
      )}

      {/* Messages */}
      <FlatList style={{ flex: 1, backgroundImage: 'linear-gradient(to bottom,rgb(243, 241, 241),rgb(57, 71, 146))'  }}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
      />

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type message..."
          style={styles.input}
        />
        <Button title="📷" onPress={sendImage} />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  header: {
    padding: 10,
    backgroundColor: 'blue',
    alignItems: 'center',
    
    width: '50%',
    alignSelf: 'center',

  },
  username: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  status: {
    color: 'white',
    fontSize: 12,
  },
  inputArea: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderColor: 'yellow',
    backgroundColor: 'lightgray',
    gap: 10,
    width: '50%',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
    padding: 8,
    marginRight: 5,
    borderRadius: 5,
    backgroundColor: 'white',
    
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 5,
  },
  selfRow: {
    justifyContent: 'flex-end',
  },
  otherRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 6,
  },
  bubble: {
    padding: 10,
    borderRadius: 10,
    maxWidth: '70%',
  },
  self: {
    backgroundColor: 'yellow',
    alignSelf: 'flex-end',
  },
  other: {
    backgroundColor: 'yellow',
    alignSelf: 'flex-start',
  },
  image: {
    width: 150,
    height: 150,
    marginTop: 5,
  },
});
