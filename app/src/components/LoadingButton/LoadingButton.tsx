import React from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, type ViewStyle} from 'react-native';
import {Colors, BorderRadius} from '../../theme';

interface LoadingButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  style?: ViewStyle;
  testID?: string;
}

export function LoadingButton({
  label, onPress, loading = false, disabled = false,
  variant = 'primary', style, testID,
}: LoadingButtonProps) {
  const isDisabled = loading || disabled;
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonGhost,
        isDisabled && (isPrimary ? styles.buttonPrimaryDisabled : styles.buttonGhostDisabled),
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled: isDisabled, busy: loading}}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.onPrimary : Colors.primary} size="small" />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelGhost]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonPrimaryDisabled: {
    backgroundColor: '#93A8D4',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  buttonGhostDisabled: {
    borderColor: '#B0BEC5',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelPrimary: {
    color: '#FFFFFF',
  },
  labelGhost: {
    color: Colors.primary,
  },
});
