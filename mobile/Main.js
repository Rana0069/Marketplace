import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = 'http://localhost:4000';

export default function Main() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('password123');
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('token').then((t) => t && setToken(t));
  }, []);

  useEffect(() => {
    if (token) loadProducts();
  }, [token]);

  const login = async () => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      AsyncStorage.setItem('token', data.token);
    }
  };

  const loadProducts = async () => {
    const res = await fetch(`${API}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setProducts(data.data || []);
  };

  const toggleFavorite = async (id, isFav) => {
    await fetch(`${API}/products/${id}/favorite`, {
      method: isFav ? 'DELETE' : 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadProducts();
  };

  if (!token) {
    return (
      <View style={{ padding: 20, gap: 10 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Mobile Login</Text>
        <TextInput style={{ borderWidth: 1, padding: 10 }} value={email} onChangeText={setEmail} />
        <TextInput style={{ borderWidth: 1, padding: 10 }} secureTextEntry value={password} onChangeText={setPassword} />
        <Pressable style={{ backgroundColor: '#4f46e5', padding: 12 }} onPress={login}>
          <Text style={{ color: 'white' }}>Login</Text>
        </Pressable>
      </View>
    );
  }

  if (selected) {
    return (
      <View style={{ padding: 20 }}>
        <Pressable onPress={() => setSelected(null)}><Text>← Back</Text></Pressable>
        <Image source={{ uri: selected.image }} style={{ height: 220, borderRadius: 10, marginTop: 10 }} />
        <Text style={{ fontSize: 24, marginTop: 10 }}>{selected.title}</Text>
        <Text style={{ color: '#4f46e5', fontSize: 18 }}>${selected.price.toFixed(2)}</Text>
        <Text>{selected.description}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ padding: 12, gap: 10 }}
      renderItem={({ item }) => (
        <Pressable onPress={() => setSelected(item)} style={{ backgroundColor: 'white', borderRadius: 10, padding: 10 }}>
          <Image source={{ uri: item.image }} style={{ height: 120, borderRadius: 10 }} />
          <Text style={{ fontSize: 18, marginTop: 6 }}>{item.title}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>${item.price.toFixed(2)}</Text>
            <Pressable onPress={() => toggleFavorite(item.id, item.isFavorite)}>
              <Text style={{ fontSize: 20, color: item.isFavorite ? '#ef4444' : '#999' }}>♥</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    />
  );
}
