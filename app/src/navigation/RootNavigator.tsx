import React, {useCallback, useEffect, useState} from 'react';
import {User} from '../types';
import {storageService} from '../storage';
import {sessionManager} from '../api/sessionManager';
import {authService} from '../api/authService';
import {AuthContext, AuthContextValue} from './AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import SplashScreen from '../features/auth/screens/SplashScreen';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

const SPLASH_TIMEOUT_MS = 3_000;

export default function RootNavigator() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timeout = new Promise<null>(resolve =>
      setTimeout(() => resolve(null), SPLASH_TIMEOUT_MS),
    );

    Promise.race([authService.restoreSession(), timeout])
      .then(result => {
        if (cancelled) return;
        if (result) {
          setUser(result.user);
          setStatus('authenticated');
        } else {
          sessionManager.clearSession();
          storageService.clearSession().catch(() => {});
          setStatus('unauthenticated');
        }
      })
      .catch(() => {
        if (cancelled) return;
        sessionManager.clearSession();
        storageService.clearSession().catch(() => {});
        setStatus('unauthenticated');
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

  if (status === 'loading') {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {status === 'authenticated' ? <AppNavigator /> : <AuthNavigator />}
    </AuthContext.Provider>
  );
}
