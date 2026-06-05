import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, type TextInputProps, View} from 'react-native';
import {Colors, BorderRadius, Spacing} from '../../theme';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  testID?: string;
}

export function AppTextInput({
  label, error, helperText, prefix, suffix,
  editable = true, testID, ...rest
}: AppTextInputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;
  const isDisabled = editable === false;

  const borderColor = hasError ? Colors.error : focused ? Colors.primary : Colors.outlineVariant;
  const bgColor = isDisabled ? '#F1F5F9' : '#FFFFFF';

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, isDisabled && styles.labelDisabled]}>
          {label}
        </Text>
      ) : null}

      <View style={[styles.inputRow, {borderColor, backgroundColor: bgColor}, hasError && styles.inputRowError]}>
        {prefix ? <View style={styles.prefix}>{prefix}</View> : null}
        <TextInput
          style={[styles.input, isDisabled && styles.inputDisabled]}
          placeholderTextColor="#9CA3AF"
          editable={editable}
          onFocus={e => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={e => { setFocused(false); rest.onBlur?.(e); }}
          testID={testID}
          accessibilityLabel={label}
          accessibilityState={{disabled: isDisabled}}
          {...rest}
        />
        {suffix ? <View style={styles.suffix}>{suffix}</View> : null}
      </View>

      {hasError ? (
        <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
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
    marginBottom: 6,
  },
  labelDisabled: {
    color: '#94A3B8',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputRowError: {
    backgroundColor: '#FFF8F8',
  },
  prefix: {marginRight: 10},
  suffix: {marginLeft: 10},
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 12,
  },
  inputDisabled: {
    color: '#94A3B8',
  },
  errorText: {
    marginTop: 4,
    marginLeft: 2,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.error,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 2,
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
  },
});
