import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {MapPin, CaretRight} from 'phosphor-react-native';
import {Colors, BorderRadius, Spacing} from '../../theme';

interface LocationFieldProps {
  value?: string | null;
  onPress?: () => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  testID?: string;
}

export function LocationField({
  value,
  onPress,
  label,
  placeholder = 'Toca para seleccionar ubicación',
  disabled = false,
  testID,
}: LocationFieldProps) {
  const interactive = !!onPress && !disabled;

  const inner = (
    <View
      style={[
        styles.field,
        value ? styles.fieldFilled : styles.fieldEmpty,
        disabled && styles.fieldDisabled,
      ]}
      accessibilityLabel={label ?? 'Ubicación'}
      accessibilityValue={{text: value ?? placeholder}}>
      <MapPin
        size={18}
        color={value ? Colors.primary : Colors.outline}
        weight={value ? 'fill' : 'regular'}
      />
      <Text
        style={[styles.valueText, !value && styles.placeholderText]}
        numberOfLines={2}>
        {value ?? placeholder}
      </Text>
      {interactive ? (
        <CaretRight size={16} color={Colors.outline} />
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
          accessibilityLabel={label ?? 'Seleccionar ubicación'}
          testID="location-field-trigger">
          {inner}
        </TouchableOpacity>
      ) : inner}
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
});
