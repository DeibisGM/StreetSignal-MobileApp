import {useRef, useState} from 'react';
import {authService} from '../../../api/authService';
import {isValidEmail} from '../../../utils';
import {useLanguage} from '../../../i18n';
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
  fieldErrors: FieldErrors;
}

const INITIAL: State = {
  email: '',
  password: '',
  showPassword: false,
  loading: false,
  error: null,
  fieldErrors: {},
};

export function useLogin(onSuccess?: (user: User) => void) {
  const {t} = useLanguage();
  const v = t.auth.validation;
  const e = t.auth.errors;

  const [state, setState] = useState<State>(INITIAL);
  const submitting = useRef(false);

  function getErrorMessage(err: unknown): string {
    if (err instanceof TypeError && err.message.includes('Network request failed')) {
      return e.noInternet;
    }
    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (
        msg.includes('401') ||
        msg.includes('invalid') ||
        msg.includes('credentials') ||
        msg.includes('unauthorized')
      ) {
        return e.invalidCredentials;
      }
      if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
        return e.serverError;
      }
    }
    return e.unexpected;
  }

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
      errors.email = v.emailRequired;
    } else if (!isValidEmail(state.email.trim())) {
      errors.email = v.emailInvalid;
    }
    if (!state.password) {
      errors.password = v.passwordRequired;
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
    setState(prev => ({...prev, loading: true, error: null}));

    try {
      const response = await authService.login({
        email: state.email.trim().toLowerCase(),
        password: state.password,
      });
      setState(prev => ({...prev, loading: false}));
      onSuccess?.(response.user);
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
    fieldErrors: state.fieldErrors,
    setEmail,
    setPassword,
    toggleShowPassword,
    submit,
    clearFieldError,
  };
}
