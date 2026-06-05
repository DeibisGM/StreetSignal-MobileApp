import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Colors, BorderRadius, Spacing} from '../../theme';
import type {Category} from '../../types';

interface CategoryPickerProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (category: Category) => void;
  label?: string;
  testID?: string;
}

export function CategoryPicker({categories, selectedId, onSelect, label, testID}: CategoryPickerProps) {
  const items = Array.isArray(categories) ? categories : [];
  return (
    <View testID={testID ?? 'category-picker'} style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled">
        {items.map(cat => {
          const isSelected = cat.id === selectedId;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => onSelect(cat)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{selected: isSelected}}
              accessibilityLabel={cat.name}
              testID={`category-option-${cat.id}`}>
              {cat.icon ? (
                <Text style={styles.catIcon} accessibilityElementsHidden>{cat.icon}</Text>
              ) : null}
              <Text style={[styles.pillLabel, isSelected && styles.pillLabelSelected]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: Spacing.marginPage,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catIcon: {
    fontSize: 14,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  pillLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
