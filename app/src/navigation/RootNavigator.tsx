import React, {useCallback, useEffect, useState} from 'react';
import {User} from '../types';
import {storageService} from '../storage';
import {sessionManager} from '../api/sessionManager';
import {authService} from '../api/authService';
import {AuthContext, AuthContextValue} from './AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

const RESTORE_TIMEOUT_MS = 3_000;

export default function RootNavigator() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timeout = new Promise<null>(resolve =>
      setTimeout(() => resolve(null), RESTORE_TIMEOUT_MS),
    );

    Promise.race([authService.restoreSession(), timeout])
      .then(result => {
        if (cancelled) return;
        if (result) {
          sessionManager.setSession(result.token, result.user);
          setUser(result.user);
          setStatus('authenticated');
        } else {
          // No stored session — only move to unauthenticated if login hasn't
          // already updated the status (race: slow Keychain vs fast login).
          setStatus(prev => (prev === 'loading' ? 'unauthenticated' : prev));
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Token was present but /auth/me rejected it — clear everything.
        sessionManager.clearSession();
        storageService.clearSession().catch(() => {});
        setStatus(prev => (prev === 'loading' ? 'unauthenticated' : prev));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((loggedUser: User) => {
    setUser(loggedUser);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(() => {
    sessionManager.clearSession();
    storageService.clearSession().catch(() => {});
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    sessionManager.setUnauthorizedHandler(logout);
  }, [logout]);

  const contextValue: AuthContextValue = {
    isAuthenticated: status === 'authenticated',
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {status === 'authenticated' ? <AppNavigator /> : <AuthNavigator initialLoading={status === 'loading'} />}
    </AuthContext.Provider>
  );
}
