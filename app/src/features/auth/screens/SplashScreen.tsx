import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container} testID="splash-screen">
      <Text style={styles.title}>StreetSignal</Text>
      <ActivityIndicator size="large" color="#A8C4E0" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3C5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 32,
  },
  spinner: {
    marginTop: 8,
  },
});
