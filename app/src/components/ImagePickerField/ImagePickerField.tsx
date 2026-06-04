import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Camera, X} from 'phosphor-react-native';
import {Colors, BorderRadius, Spacing} from '../../theme';

interface ImagePickerFieldProps {
  value?: string | null;
  onPick: () => void;
  onRemove?: () => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  testID?: string;
}

export function ImagePickerField({
  value,
  onPick,
  onRemove,
  label,
  placeholder = 'Agregar foto',
  disabled = false,
  testID,
}: ImagePickerFieldProps) {
  return (
    <View style={styles.wrapper} testID={testID ?? 'image-picker-field'}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {value ? (
        <View style={styles.previewWrapper}>
          <Image
            source={{uri: value}}
            style={styles.preview}
            resizeMode="cover"
            accessibilityLabel="Imagen seleccionada"
          />
          {!disabled && onRemove ? (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={onRemove}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityRole="button"
              accessibilityLabel="Eliminar imagen"
              testID="image-picker-remove">
              <X size={12} color="#fff" weight="bold" />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.emptyArea, disabled && styles.emptyAreaDisabled]}
          onPress={disabled ? undefined : onPick}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={placeholder}
          accessibilityState={{disabled}}
          testID="image-picker-trigger">
          <Camera
            size={28}
            color={disabled ? Colors.outline : Colors.onSurfaceVariant}
            weight="light"
          />
          <Text style={[styles.placeholderText, disabled && styles.placeholderTextDisabled]}>
            {placeholder}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.stackMd,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
    marginLeft: 2,
    letterSpacing: 0.1,
  },
  emptyArea: {
    height: 140,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyAreaDisabled: {opacity: 0.5},
  placeholderText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  placeholderTextDisabled: {color: Colors.outline},
  previewWrapper: {position: 'relative'},
  preview: {
    height: 180,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
