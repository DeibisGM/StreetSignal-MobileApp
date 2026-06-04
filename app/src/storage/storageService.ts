import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

import {ReportStatus, User} from '../types';

// --- Storage keys ---------------------------------------------------------

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth.token',
  AUTH_USER: 'auth.user',
  STAFF_LAST_FILTER: 'staff.lastFilter',
  REPORT_DRAFT: 'report.draft',
} as const;

// --- Domain types stored --------------------------------------------------

export interface StaffFilter {
  status?: ReportStatus;
  categoryId?: number;
  search?: string;
}

export interface ReportDraft {
  title: string;
  description: string;
  categoryId: number;
  imageUri?: string;
}

export interface StoredSession {
  token: string;
  user: User;
}

// --- Internal -----------------------------------------------------------

const KEYCHAIN_SERVICE = 'StreetSignal';

async function asyncGet<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return null;
  return JSON.parse(raw) as T;
}

async function asyncSet<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function asyncRemove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

// --- Public API ----------------------------------------------------------

export const storageService = {
  // Generic typed key-value API (AsyncStorage, for non-sensitive data).
  getItem: asyncGet,
  setItem: asyncSet,
  removeItem: asyncRemove,

  // Persist token to Keychain / Keystore and user to AsyncStorage.
  saveSession: async (token: string, user: User): Promise<void> => {
    await Promise.all([
      Keychain.setGenericPassword('token', token, {service: KEYCHAIN_SERVICE}),
      asyncSet<Pick<User, 'id' | 'fullName' | 'email' | 'role'>>(
        STORAGE_KEYS.AUTH_USER,
        {id: user.id, fullName: user.fullName, email: user.email, role: user.role},
      ),
    ]);
  },

  // Read token from Keychain and user from AsyncStorage.
  // Returns null if either piece is missing.
  loadSession: async (): Promise<StoredSession | null> => {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });
    if (!credentials) return null;

    const partial = await asyncGet<Pick<User, 'id' | 'fullName' | 'email' | 'role'>>(
      STORAGE_KEYS.AUTH_USER,
    );
    if (!partial) return null;

    // Reconstruct a minimal User; full profile is fetched from /auth/me when needed.
    const user: User = {
      ...partial,
      isActive: true,
      createdAt: '',
    };

    return {token: credentials.password, user};
  },

  // Remove all four persisted keys.
  clearSession: async (): Promise<void> => {
    await Promise.all([
      Keychain.resetGenericPassword({service: KEYCHAIN_SERVICE}),
      asyncRemove(STORAGE_KEYS.AUTH_USER),
      asyncRemove(STORAGE_KEYS.STAFF_LAST_FILTER),
      asyncRemove(STORAGE_KEYS.REPORT_DRAFT),
    ]);
  },
};
