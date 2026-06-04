import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {Icon as PhosphorIcon} from 'phosphor-react-native';
import {Colors, Spacing} from '../../theme';
import {LoadingButton} from '../LoadingButton';

interface EmptyStateProps {
  Icon?: React.ComponentType<React.ComponentProps<typeof PhosphorIcon>>;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export function EmptyState({Icon, title, subtitle, actionLabel, onAction, testID}: EmptyStateProps) {
  return (
    <View style={styles.container} testID={testID ?? 'empty-state'}>
      {Icon ? (
        <Icon size={52} color={Colors.primary} weight="thin" style={styles.icon} />
      ) : null}
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <LoadingButton label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.stackXl,
    paddingHorizontal: Spacing.marginPage,
  },
  icon: {
    marginBottom: Spacing.stackMd,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.stackLg,
  },
  action: {
    minWidth: 160,
  },
});
