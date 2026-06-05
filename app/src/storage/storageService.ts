import AsyncStorage from '@react-native-async-storage/async-storage';

import {ReportStatus, User} from '../types';

// --- Storage keys ---------------------------------------------------------

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ss.auth.token',
  AUTH_USER: 'ss.auth.user',
  STAFF_LAST_FILTER: 'ss.staff.lastFilter',
  REPORT_DRAFT: 'ss.report.draft',
} as const;

// --- Domain types stored --------------------------------------------------

export interface StaffFilter {
  status?: ReportStatus;
  categoryId?: string;
  search?: string;
}

export interface ReportDraft {
  title: string;
  description: string;
  categoryId: string;
  imageUri?: string;
}

export interface StoredSession {
  token: string;
  user: User;
}

// --- Internal helpers -----------------------------------------------------

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
  getItem: asyncGet,
  setItem: asyncSet,
  removeItem: asyncRemove,

  saveSession: async (token: string, user: User): Promise<void> => {
    await Promise.all([
      asyncSet<string>(STORAGE_KEYS.AUTH_TOKEN, token),
      asyncSet<Pick<User, 'id' | 'fullName' | 'email' | 'role'>>(
        STORAGE_KEYS.AUTH_USER,
        {id: user.id, fullName: user.fullName, email: user.email, role: user.role},
      ),
    ]);
  },

  loadSession: async (): Promise<StoredSession | null> => {
    const token = await asyncGet<string>(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return null;

    const partial = await asyncGet<Pick<User, 'id' | 'fullName' | 'email' | 'role'>>(
      STORAGE_KEYS.AUTH_USER,
    );
    if (!partial) return null;

    const user: User = {...partial, isActive: true, createdAt: ''};
    return {token, user};
  },

  clearSession: async (): Promise<void> => {
    await Promise.all([
      asyncRemove(STORAGE_KEYS.AUTH_TOKEN),
      asyncRemove(STORAGE_KEYS.AUTH_USER),
      asyncRemove(STORAGE_KEYS.STAFF_LAST_FILTER),
      asyncRemove(STORAGE_KEYS.REPORT_DRAFT),
    ]);
  },
};
