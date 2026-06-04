import React, {createContext, useContext} from 'react';
import {User} from '../types';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface AuthContextValue extends AuthState {
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthContext.Provider');
  }
  return ctx;
}
