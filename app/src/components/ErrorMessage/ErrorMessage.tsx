import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {WarningCircle} from 'phosphor-react-native';
import {Colors, BorderRadius, Spacing} from '../../theme';

interface ErrorMessageProps {
  message: string | null | undefined;
  testID?: string;
}

export function ErrorMessage({message, testID}: ErrorMessageProps) {
  if (!message) {return null;}

  return (
    <View
      style={styles.container}
      testID={testID ?? 'error-message'}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive">
      <WarningCircle size={18} color={Colors.error} weight="fill" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
    paddingHorizontal: Spacing.gutter,
    paddingVertical: 10,
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#991B1B',
  },
});
