import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {MapPin, ArrowClockwise} from 'phosphor-react-native';
import {Colors, BorderRadius, Spacing} from '../../theme';

interface LocationFieldProps {
  value?: string | null;
  onPress?: () => void;
  label?: string;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function LocationField({
  value,
  onPress,
  label,
  placeholder = 'Toca para buscar ubicacion',
  loading = false,
  disabled = false,
  testID,
}: LocationFieldProps) {
  const interactive = !!onPress && !disabled && !loading;

  const inner = (
    <View
      style={[
        styles.field,
        value ? styles.fieldFilled : styles.fieldEmpty,
        (disabled || loading) && styles.fieldDisabled,
      ]}
      accessibilityLabel={label ?? 'Ubicacion'}
      accessibilityValue={{
        text: loading ? 'Buscando ubicacion' : value ?? placeholder,
      }}>
      <MapPin
        size={18}
        color={loading ? Colors.primary : value ? Colors.primary : Colors.outline}
        weight={value || loading ? 'fill' : 'regular'}
      />
      <Text
        style={[styles.valueText, !value && styles.placeholderText]}
        numberOfLines={2}>
        {loading ? 'Buscando ubicacion...' : value ?? placeholder}
      </Text>
      {loading ? (
        <View style={styles.loadingPill}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : interactive ? (
        <View style={styles.actionPill}>
          <ArrowClockwise size={14} color={Colors.primary} weight="bold" />
          <Text style={styles.actionText}>Buscar otra vez</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.wrapper} testID={testID ?? 'location-field'}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {interactive ? (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={label ?? 'Buscar ubicacion'}
          testID="location-field-trigger">
          {inner}
        </TouchableOpacity>
      ) : (
        inner
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {marginBottom: Spacing.stackMd},
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
    marginLeft: 2,
    letterSpacing: 0.1,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  fieldFilled: {
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
  },
  fieldEmpty: {
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
    backgroundColor: Colors.surfaceContainerLow,
  },
  fieldDisabled: {opacity: 0.55},
  valueText: {
    flex: 1,
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 20,
  },
  placeholderText: {color: Colors.outline},
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#EEF4FF',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  loadingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#EEF4FF',
  },
});
