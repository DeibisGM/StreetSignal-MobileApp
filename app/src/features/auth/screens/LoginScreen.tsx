import React from 'react';
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
import {AppLogo} from '../../../components/AppLogo';
import {ErrorMessage} from '../../../components/auth/ErrorMessage';
import {LoadingButton} from '../../../components/auth/LoadingButton';
import {SuccessToast} from '../../../components/SuccessToast';
import {useLogin} from '../hooks/useLogin';
import {useAuth} from '../../../navigation/AuthContext';
import {BASE_URL} from '../../../api';

interface Props {
  onNavigateToRegister?: () => void;
  successMessage?: string | null;
  onDismissSuccess?: () => void;
}

export function LoginScreen({onNavigateToRegister, successMessage, onDismissSuccess}: Props) {
  const {login} = useAuth();
  const {
    email,
    password,
    showPassword,
    loading,
    error,
    fieldErrors,
    setEmail,
    setPassword,
    toggleShowPassword,
    submit,
  } = useLogin(login);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1A3C5E" />
      <SuccessToast
        message={successMessage ?? null}
        onDismiss={onDismissSuccess ?? (() => {})}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <AppLogo size={68} />
            <Text style={styles.appName}>StreetSignal</Text>
            <Text style={styles.tagline}>Plataforma de Reportes Ciudadanos</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Iniciar sesion</Text>
            <Text style={styles.cardSubtitle}>
              Ingresa tus credenciales para continuar
            </Text>

            {/* Global error */}
            {error ? (
              <View style={styles.errorWrapper}>
                <ErrorMessage message={error} />
              </View>
            ) : null}

            {/* Email field */}
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

            {/* Password field */}
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
                  autoComplete="password"
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
              {fieldErrors.password ? (
                <Text style={styles.fieldError}>{fieldErrors.password}</Text>
              ) : null}
            </View>

            {/* Submit */}
            <LoadingButton
              label="Iniciar sesion"
              onPress={submit}
              loading={loading}
              testID="submit-button"
              style={styles.submitButton}
            />

            <View style={styles.debugBox}>
              <Text style={styles.debugText}>API: {BASE_URL}</Text>
              </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>No tienes cuenta? </Text>
              <TouchableOpacity onPress={onNavigateToRegister} testID="go-to-register">
                <Text style={styles.registerLink}>Registrate</Text>
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

  // Submit
  submitButton: {
    marginTop: 6,
    marginBottom: 20,
  },
  debugBox: {
    backgroundColor: '#F3F8FC',
    borderColor: '#D8E7F3',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 18,
    padding: 10,
  },
  debugText: {
    color: '#345873',
    fontSize: 11,
    lineHeight: 16,
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

  // Register
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6B8BA4',
  },
  registerLink: {
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
