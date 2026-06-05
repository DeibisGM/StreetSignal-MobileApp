import React, {useCallback, useEffect, useRef, useState} from 'react';
import {User} from '../types';
import {authService} from '../api/authService';
import {sessionManager} from '../api/sessionManager';
import {storageService} from '../storage';
import {notificationService} from '../services/notificationService';
import {useNotificationPolling} from '../hooks/useNotificationPolling';
import {AuthContext, AuthContextValue} from './AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

const RESTORE_TIMEOUT_MS = 3_000;

export default function RootNavigator() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  // Ref para saber si login() fue llamado antes de que termine restoreSession
  const loginCalledRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loginCalledRef.current = false;

    const timeout = new Promise<null>(resolve =>
      setTimeout(() => resolve(null), RESTORE_TIMEOUT_MS),
    );

    Promise.race([authService.restoreSession(), timeout])
      .then(result => {
        if (cancelled) return;
        // Si login() ya fue llamado (usuario logueó antes de que
        // terminara la restauración), no pisamos el estado.
        if (loginCalledRef.current) return;

        if (result) {
          sessionManager.setSession(result.token, result.user);
          setUser(result.user);
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
        }
      })
      .catch(() => {
        if (cancelled || loginCalledRef.current) return;
        sessionManager.clearSession();
        storageService.clearSession().catch(() => {});
        setStatus('unauthenticated');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((loggedUser: User) => {
    loginCalledRef.current = true;
    setUser(loggedUser);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    sessionManager.setUnauthorizedHandler(logout);
  }, [logout]);

  // Request notification permission and register device token once authenticated
  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }
    notificationService.requestPermission().catch(() => {});
    notificationService.registerWithServer().catch(() => {});
  }, [status]);

  useNotificationPolling(status === 'authenticated');

  const contextValue: AuthContextValue = {
    isAuthenticated: status === 'authenticated',
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {status === 'authenticated'
        ? <AppNavigator />
        : <AuthNavigator initialLoading={status === 'loading'} />}
    </AuthContext.Provider>
  );
}