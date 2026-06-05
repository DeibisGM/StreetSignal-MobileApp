import {useRef, useState} from 'react';
import {authService} from '../../../api/authService';
import {isValidEmail} from '../../../utils';
import {useLanguage} from '../../../i18n';

export type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong';

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface State {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  loading: boolean;
  error: string | null;
  success: boolean;
  fieldErrors: FieldErrors;
}

const INITIAL: State = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  showPassword: false,
  showConfirmPassword: false,
  loading: false,
  error: null,
  success: false,
  fieldErrors: {},
};

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) {return 'none';}
  if (password.length < 6) {return 'weak';}

  let score = 0;
  if (/[a-z]/.test(password)) {score++;}
  if (/[A-Z]/.test(password)) {score++;}
  if (/[0-9]/.test(password)) {score++;}
  if (/[^a-zA-Z0-9]/.test(password)) {score++;}

  if (password.length >= 8 && score >= 3) {return 'strong';}
  if (score >= 2) {return 'medium';}
  return 'weak';
}

export function useRegister() {
  const {t} = useLanguage();
  const v = t.auth.validation;
  const e = t.auth.errors;

  const [state, setState] = useState<State>(INITIAL);
  const submitting = useRef(false);

  const passwordStrength = getPasswordStrength(state.password);

  function getErrorMessage(err: unknown): string {
    if (err instanceof TypeError && err.message.includes('Network request failed')) {
      return e.noInternet;
    }
    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (
        msg.includes('409') ||
        msg.includes('already') ||
        msg.includes('exist') ||
        msg.includes('duplicate') ||
        msg.includes('conflict') ||
        msg.includes('registrado') ||
        msg.includes('uso')
      ) {
        return e.emailInUse;
      }
      if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
        return e.serverError;
      }
    }
    return e.unexpected;
  }

  function setFullName(value: string) {
    setState(prev => {
      const next = {...prev.fieldErrors};
      delete next.fullName;
      return {...prev, fullName: value, fieldErrors: next, error: null};
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
      if (prev.confirmPassword && value !== prev.confirmPassword) {
        next.confirmPassword = v.passwordsMismatch;
      } else if (prev.confirmPassword && value === prev.confirmPassword) {
        delete next.confirmPassword;
      }
      return {...prev, password: value, fieldErrors: next, error: null};
    });
  }

  function setConfirmPassword(value: string) {
    setState(prev => {
      const next = {...prev.fieldErrors};
      if (value && value !== prev.password) {
        next.confirmPassword = v.passwordsMismatch;
      } else {
        delete next.confirmPassword;
      }
      return {...prev, confirmPassword: value, fieldErrors: next, error: null};
    });
  }

  function toggleShowPassword() {
    setState(prev => ({...prev, showPassword: !prev.showPassword}));
  }

  function toggleShowConfirmPassword() {
    setState(prev => ({...prev, showConfirmPassword: !prev.showConfirmPassword}));
  }

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!state.fullName.trim()) {
      errors.fullName = v.nameRequired;
    } else if (state.fullName.trim().length < 3) {
      errors.fullName = v.nameTooShort;
    }

    if (!state.email.trim()) {
      errors.email = v.emailRequired;
    } else if (!isValidEmail(state.email.trim())) {
      errors.email = v.emailInvalid;
    }

    if (!state.password) {
      errors.password = v.passwordRequired;
    } else if (state.password.length < 6) {
      errors.password = v.passwordTooShort;
    }

    if (!state.confirmPassword) {
      errors.confirmPassword = v.confirmPasswordRequired;
    } else if (state.password !== state.confirmPassword) {
      errors.confirmPassword = v.passwordsMismatch;
    }

    setState(prev => ({...prev, fieldErrors: errors}));
    return Object.keys(errors).length === 0;
  }

  async function submit() {
    if (submitting.current || state.loading) {
      if (__DEV__) {
        console.log('[AUTH] register submit ignored', {
          submitting: submitting.current,
          loading: state.loading,
        });
      }
      return;
    }
    if (__DEV__) {
      console.log('[AUTH] register submit tapped', {
        email: state.email.trim().toLowerCase(),
        fullNameLength: state.fullName.trim().length,
        passwordLength: state.password.length,
      });
    }
    if (!validate()) {
      if (__DEV__) {
        console.warn('[AUTH] register validation failed', state.fieldErrors);
      }
      return;
    }

    submitting.current = true;
    setState(prev => ({...prev, loading: true, error: null, success: false}));

    try {
      await authService.register({
        fullName: state.fullName.trim(),
        email: state.email.trim().toLowerCase(),
        password: state.password,
        confirmPassword: state.confirmPassword,
      });
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
    fullName: state.fullName,
    email: state.email,
    password: state.password,
    confirmPassword: state.confirmPassword,
    showPassword: state.showPassword,
    showConfirmPassword: state.showConfirmPassword,
    loading: state.loading,
    error: state.error,
    success: state.success,
    fieldErrors: state.fieldErrors,
    passwordStrength,
    setFullName,
    setEmail,
    setPassword,
    setConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    submit,
  };
}
