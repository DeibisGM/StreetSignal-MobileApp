import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useLanguage} from '../../../i18n';

export default function NotificationsScreen() {
  const {t} = useLanguage();

  return (
    <View style={styles.container} testID="notifications-screen">
      <Text style={styles.title}>{t.notifications.title}</Text>
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
