import React, {useEffect} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {ErrorMessage} from '../../../components/auth/ErrorMessage';
import {LoadingButton} from '../../../components/auth/LoadingButton';
import {useRegister, type PasswordStrength} from '../hooks/useRegister';

interface Props {
  onNavigateToLogin?: (message?: string) => void;
}

const STRENGTH_CONFIG: Record<
  PasswordStrength,
  {label: string; color: string; bars: number}
> = {
  none: {label: '', color: '#DDE8F2', bars: 0},
  weak: {label: 'Debil', color: '#F44336', bars: 1},
  medium: {label: 'Media', color: '#FF9800', bars: 2},
  strong: {label: 'Fuerte', color: '#4CAF50', bars: 3},
};

export function RegisterScreen({onNavigateToLogin}: Props) {
  const {
    fullName,
    email,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    loading,
    error,
    success,
    fieldErrors,
    passwordStrength,
    setFullName,
    setEmail,
    setPassword,
    setConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    submit,
  } = useRegister();

  useEffect(() => {
    if (success) {
      onNavigateToLogin?.('Cuenta creada correctamente. Ya puedes iniciar sesion.');
    }
  }, [success, onNavigateToLogin]);

  const strength = STRENGTH_CONFIG[passwordStrength];
  const strengthLabelStyle = {color: strength.color};
  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === password;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1A3C5E" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Text style={styles.logoInitial}>S</Text>
            </View>
            <Text style={styles.appName}>StreetSignal</Text>
            <Text style={styles.tagline}>Plataforma de Reportes Ciudadanos</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crear cuenta</Text>
            <Text style={styles.cardSubtitle}>
              Completa los datos para registrarte
            </Text>

            {error ? (
              <View style={styles.errorWrapper}>
                <ErrorMessage message={error} />
              </View>
            ) : null}

            {/* Full name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nombre completo</Text>
              <View
                style={[
                  styles.inputWrapper,
                  fieldErrors.fullName ? styles.inputWrapperError : null,
                ]}>
                <Text style={styles.inputPrefix}>A</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre completo"
                  placeholderTextColor="#A0B8D0"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!loading}
                  testID="fullname-input"
                />
              </View>
              {fieldErrors.fullName ? (
                <Text style={styles.fieldError}>{fieldErrors.fullName}</Text>
              ) : null}
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Correo electronico</Text>
              <View
                style={[
                  styles.inputWrapper,
                  fieldErrors.email ? styles.inputWrapperError : null,
                ]}>
                <Text style={styles.inputPrefix}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor="#A0B8D0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!loading}
                  testID="email-input"
                />
              </View>
              {fieldErrors.email ? (
                <Text style={styles.fieldError}>{fieldErrors.email}</Text>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Contrasena</Text>
              <View
                style={[
                  styles.inputWrapper,
                  fieldErrors.password ? styles.inputWrapperError : null,
                ]}>
                <Text style={styles.inputPrefix}>*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimo 6 caracteres"
                  placeholderTextColor="#A0B8D0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  testID="password-input"
                />
                <TouchableOpacity
                  onPress={toggleShowPassword}
                  style={styles.eyeButton}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  testID="toggle-password">
                  <Text style={styles.eyeText}>
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </Text>
                </TouchableOpacity>
              </View>
              {password.length > 0 ? (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3].map(level => {
                      const barStyle = {
                        backgroundColor:
                          strength.bars >= level ? strength.color : '#DDE8F2',
                      };
                      return (
                        <View
                          key={level}
                          style={[styles.strengthBar, barStyle]}
                        />
                      );
                    })}
                  </View>
                  {strength.label ? (
                    <Text style={[styles.strengthLabel, strengthLabelStyle]}>
                      {strength.label}
                    </Text>
                  ) : null}
                </View>
              ) : null}
              {fieldErrors.password ? (
                <Text style={styles.fieldError}>{fieldErrors.password}</Text>
              ) : null}
            </View>

            {/* Confirm password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirmar contrasena</Text>
              <View
                style={[
                  styles.inputWrapper,
                  fieldErrors.confirmPassword
                    ? styles.inputWrapperError
                    : null,
                  passwordsMatch && !fieldErrors.confirmPassword
                    ? styles.inputWrapperSuccess
                    : null,
                ]}>
                <Text style={styles.inputPrefix}>*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repite tu contrasena"
                  placeholderTextColor="#A0B8D0"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  testID="confirm-password-input"
                />
                <TouchableOpacity
                  onPress={toggleShowConfirmPassword}
                  style={styles.eyeButton}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  testID="toggle-confirm-password">
                  <Text style={styles.eyeText}>
                    {showConfirmPassword ? 'Ocultar' : 'Ver'}
                  </Text>
                </TouchableOpacity>
              </View>
              {fieldErrors.confirmPassword ? (
                <Text style={styles.fieldError}>
                  {fieldErrors.confirmPassword}
                </Text>
              ) : passwordsMatch ? (
                <Text style={styles.matchText}>Las contrasenas coinciden</Text>
              ) : null}
            </View>

            {/* Submit */}
            <LoadingButton
              label="Crear cuenta"
              onPress={submit}
              loading={loading}
              testID="submit-button"
              style={styles.submitButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => onNavigateToLogin?.()} testID="go-to-login">
                <Text style={styles.loginLink}>Inicia sesion</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>StreetSignal v1.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1A3C5E',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logoInitial: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 13,
    color: '#A8C4E0',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3C5E',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B8BA4',
    marginBottom: 24,
  },

  // Error
  errorWrapper: {
    marginBottom: 18,
  },

  // Fields
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D4F6C',
    marginBottom: 7,
    letterSpacing: 0.1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DDE8F2',
    borderRadius: 10,
    backgroundColor: '#F5F9FE',
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputWrapperError: {
    borderColor: '#F44336',
    backgroundColor: '#FFF9F9',
  },
  inputWrapperSuccess: {
    borderColor: '#4CAF50',
    backgroundColor: '#F5FFF6',
  },
  inputPrefix: {
    fontSize: 16,
    color: '#7A9BB5',
    marginRight: 10,
    fontWeight: '500',
    width: 16,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A2E45',
    paddingVertical: 12,
  },
  eyeButton: {
    paddingLeft: 10,
  },
  eyeText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  fieldError: {
    fontSize: 12,
    color: '#E53935',
    marginTop: 5,
    marginLeft: 2,
  },
  matchText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 5,
    marginLeft: 2,
    fontWeight: '500',
  },

  // Password strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 44,
    textAlign: 'right',
  },

  // Submit
  submitButton: {
    marginTop: 6,
    marginBottom: 20,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8EFF6',
  },
  dividerText: {
    fontSize: 12,
    color: '#9DB3C8',
    fontWeight: '500',
  },

  // Login link
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B8BA4',
  },
  loginLink: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '700',
  },

  // Footer
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#5A7A99',
    marginTop: 24,
  },
});
