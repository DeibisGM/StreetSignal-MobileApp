import {useRef, useState} from 'react';
import {authService} from '../../../services/auth/authService';
import {storageService} from '../../../storage/auth/storageService';
import {sessionManager} from '../../../api/sessionManager';
import {isValidEmail} from '../../../utils';
import type {User} from '../../../types';

interface FieldErrors {
  email?: string;
  password?: string;
}

interface State {
  email: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  error: string | null;
  debugStatus: string;
  success: boolean;
  fieldErrors: FieldErrors;
}

const INITIAL: State = {
  email: '',
  password: '',
  showPassword: false,
  loading: false,
  error: null,
  debugStatus: 'Esperando intento de login',
  success: false,
  fieldErrors: {},
};

function getErrorMessage(err: unknown): string {
  if (err instanceof TypeError && err.message.includes('Network request failed')) {
    return 'Sin conexión a internet. Verifica tu red e intenta de nuevo.';
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (
      msg.includes('401') ||
      msg.includes('invalid') ||
      msg.includes('credentials') ||
      msg.includes('unauthorized')
    ) {
      return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    }
    if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
      return 'Error en el servidor. Intenta de nuevo en unos momentos.';
    }
  }
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}

export function useLogin(onSuccess?: (user: User) => void) {
  const [state, setState] = useState<State>(INITIAL);
  const submitting = useRef(false);

  function clearFieldError(field: keyof FieldErrors) {
    setState(prev => {
      const next = {...prev.fieldErrors};
      delete next[field];
      return {...prev, fieldErrors: next, error: null};
    });
  }

  function setEmail(value: string) {
    setState(prev => {
      const next = {...prev.fieldErrors};
      delete next.email;
      return {...prev, email: value, fieldErrors: next, error: null};
    });
  }

  function setPassword(value: string) {
    setState(prev => {
      const next = {...prev.fieldErrors};
      delete next.password;
      return {...prev, password: value, fieldErrors: next, error: null};
    });
  }

  function toggleShowPassword() {
    setState(prev => ({...prev, showPassword: !prev.showPassword}));
  }

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!state.email.trim()) {
      errors.email = 'El correo es obligatorio';
    } else if (!isValidEmail(state.email.trim())) {
      errors.email = 'Ingresa un correo con formato válido';
    }
    if (!state.password) {
      errors.password = 'La contraseña es obligatoria';
    }
    setState(prev => ({...prev, fieldErrors: errors}));
    return Object.keys(errors).length === 0;
  }

  async function submit() {
    if (submitting.current || state.loading) {
      setState(prev => ({
        ...prev,
        debugStatus: 'Login ignorado: ya hay una solicitud en curso',
      }));
      if (__DEV__) {
        console.log('[AUTH] login submit ignored', {
          submitting: submitting.current,
          loading: state.loading,
        });
      }
      return;
    }
    if (__DEV__) {
      console.log('[AUTH] login submit tapped', {
        email: state.email.trim().toLowerCase(),
        passwordLength: state.password.length,
      });
    }
    setState(prev => ({
      ...prev,
      debugStatus: 'Boton presionado, validando formulario',
    }));
    if (!validate()) {
      setState(prev => ({
        ...prev,
        debugStatus: 'Validacion fallida antes de llamar al API',
      }));
      if (__DEV__) {
        console.warn('[AUTH] login validation failed', state.fieldErrors);
      }
      return;
    }

    submitting.current = true;
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      debugStatus: 'Enviando POST /auth/login',
      success: false,
    }));

    try {
      if (__DEV__) {
        console.log('[AUTH] login submit', {
          email: state.email.trim().toLowerCase(),
          hasPassword: state.password.length > 0,
        });
      }
      const response = await authService.login({
        email: state.email.trim().toLowerCase(),
        password: state.password,
      });
      if (__DEV__) {
        console.log('[AUTH] login success', {
          userId: response.user.id,
          email: response.user.email,
        });
      }
      sessionManager.setSession(response.token, response.user);
      storageService.saveSession(response.token, response.user).catch(() => {});
      setState(prev => ({
        ...prev,
        loading: false,
        debugStatus: 'Login exitoso: token recibido',
        success: true,
      }));
      onSuccess?.(response.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (__DEV__) {
        console.warn('[AUTH] login failed', err);
      }
      setState(prev => ({
        ...prev,
        loading: false,
        debugStatus: `Fallo login: ${message}`,
        error: getErrorMessage(err),
      }));
    } finally {
      submitting.current = false;
    }
  }

  return {
    email: state.email,
    password: state.password,
    showPassword: state.showPassword,
    loading: state.loading,
    error: state.error,
    debugStatus: state.debugStatus,
    success: state.success,
    fieldErrors: state.fieldErrors,
    setEmail,
    setPassword,
    toggleShowPassword,
    submit,
    clearFieldError,
  };
}
