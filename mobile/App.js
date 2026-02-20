import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import Main from './src/Main';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, marginTop: StatusBar.currentHeight || 0 }}>
      <Main />
    </SafeAreaView>
  );
}
