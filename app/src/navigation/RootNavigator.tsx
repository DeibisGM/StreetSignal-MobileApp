import React, {useCallback, useEffect, useState} from 'react';
import {User} from '../types';
import {storageService} from '../storage';
import {sessionManager} from '../api/sessionManager';
import {AuthContext, AuthContextValue} from './AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export default function RootNavigator() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    storageService
      .loadSession()
      .then(session => {
        if (session) {
          sessionManager.setSession(session.token, session.user);
          setUser(session.user);
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
        }
      })
      .catch(() => {
        setStatus('unauthenticated');
      });
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

  // Show nothing while the stored session is being read.
  if (status === 'loading') {
    return null;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {status === 'authenticated' ? <AppNavigator /> : <AuthNavigator />}
    </AuthContext.Provider>
  );
}
