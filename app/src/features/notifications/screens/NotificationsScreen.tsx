import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function NotificationsScreen() {
  return (
    <View style={styles.container} testID="notifications-screen">
      <Text style={styles.title}>Notificaciones</Text>
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
