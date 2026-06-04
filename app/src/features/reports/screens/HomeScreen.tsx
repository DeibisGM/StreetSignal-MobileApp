import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container} testID="home-screen">
      <Text style={styles.title}>Inicio</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A3C5E',
  },
});
