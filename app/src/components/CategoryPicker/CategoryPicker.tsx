import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as PhosphorIcons from 'phosphor-react-native';
import type {IconProps} from 'phosphor-react-native';
import {Colors, BorderRadius, Spacing} from '../../theme';
import type {Category} from '../../types';

type IconComponent = React.ComponentType<IconProps>;

// Generic fallback when a category has no icon or an unrecognised name.
const FALLBACK_ICON = PhosphorIcons.Tag as IconComponent;

// Converts a phosphor icon name (kebab-case, e.g. "road-horizon") into the
// exported component name (PascalCase, e.g. "RoadHorizon").
function toPascalCase(name: string): string {
  return name
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

// Resolves the `icon` field (a phosphor export name) to its component by looking
// it up dynamically in the phosphor module. Accepts both exact export names
// (e.g. "TrashIcon", "RoadHorizonIcon") and kebab-case names (e.g.
// "road-horizon"). Any valid phosphor name works without maintaining a map;
// unknown / missing names fall back to a generic icon.
function resolveIcon(name?: string | null): IconComponent {
  if (!name) {
    return FALLBACK_ICON;
  }
  const icons = PhosphorIcons as Record<string, unknown>;
  const exact = icons[name.trim()];
  if (exact) {
    return exact as IconComponent;
  }
  const pascal = icons[toPascalCase(name)];
  return (pascal as IconComponent) ?? FALLBACK_ICON;
}

interface CategoryPickerProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (category: Category) => void;
  label?: string;
  loading?: boolean;
  testID?: string;
}

export function CategoryPicker({categories, selectedId, onSelect, label, loading, testID}: CategoryPickerProps) {
  const items = Array.isArray(categories) ? categories : [];

  return (
    <View testID={testID ?? 'category-picker'} style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando categorías...</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
          keyboardShouldPersistTaps="handled">
          {items.map(cat => {
            const isSelected = cat.id === selectedId;
            const Icon = resolveIcon(cat.icon);
            const tint = cat.color ?? Colors.primary;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.pill,
                  isSelected
                    ? {backgroundColor: tint, borderColor: tint}
                    : styles.pillIdle,
                ]}
                onPress={() => onSelect(cat)}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{selected: isSelected}}
                accessibilityLabel={cat.name}
                testID={`category-option-${cat.id}`}>
                <Icon
                  size={15}
                  color={isSelected ? '#FFFFFF' : Colors.onSurfaceVariant}
                  weight={isSelected ? 'fill' : 'regular'}
                />
                <Text style={[styles.pillLabel, isSelected && styles.pillLabelSelected]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
    color: '#1E293B',
    marginBottom: 8,
    marginLeft: 2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    gap: 6,
  },
  pillIdle: {
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: Colors.outlineVariant,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  pillLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
