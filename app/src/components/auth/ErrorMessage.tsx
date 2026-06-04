import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface Props {
  message: string | null;
}

export function ErrorMessage({message}: Props) {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>!</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3F3',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  icon: {
    color: '#F44336',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    width: 16,
    textAlign: 'center',
  },
  text: {
    flex: 1,
    color: '#C62828',
    fontSize: 14,
    lineHeight: 20,
  },
});
