import {useRef, useState} from 'react';
import {authService} from '../../../services/auth/authService';
import {storageService} from '../../../storage/auth/storageService';
import {isValidEmail} from '../../../utils';

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
  success: boolean;
  fieldErrors: FieldErrors;
}

const INITIAL: State = {
  email: '',
  password: '',
  showPassword: false,
  loading: false,
  error: null,
  success: false,
  fieldErrors: {},
};

function getErrorMessage(err: unknown): string {
  if (err instanceof TypeError) {
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

export function useLogin() {
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
      return;
    }
    if (!validate()) {
      return;
    }

    submitting.current = true;
    setState(prev => ({...prev, loading: true, error: null, success: false}));

    try {
      const response = await authService.login({
        email: state.email.trim().toLowerCase(),
        password: state.password,
      });
      await storageService.saveSession(response.token, response.user);
      setState(prev => ({...prev, loading: false, success: true}));
    } catch (err: unknown) {
      setState(prev => ({
        ...prev,
        loading: false,
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
    success: state.success,
    fieldErrors: state.fieldErrors,
    setEmail,
    setPassword,
    toggleShowPassword,
    submit,
    clearFieldError,
  };
}
