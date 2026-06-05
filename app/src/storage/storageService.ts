import AsyncStorage from '@react-native-async-storage/async-storage';

import {Report, ReportStatus, User} from '../types';

// --- Storage keys ---------------------------------------------------------

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ss.auth.token',
  AUTH_USER: 'ss.auth.user',
  STAFF_LAST_FILTER: 'ss.staff.lastFilter',
  STAFF_REPORTS_CACHE: 'ss.staff.reports.cache',
  REPORT_DRAFT: 'ss.report.draft',
  /**
   * Prefix for per-report detail cache. The full key is
   * `${REPORT_DETAIL_CACHE_PREFIX}${reportId}` so each visited report
   * gets its own slot — that way the last detail re-hydrates instantly
   * when the citizen re-taps the same card.
   */
  REPORT_DETAIL_CACHE_PREFIX: 'ss.report.detail.cache.',
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

  /**
   * Read a cached report detail. Returns null if the user has never
   * visited this report before (or cleared the cache).
   */
  getReportDetailCache: async (reportId: string): Promise<Report | null> =>
    asyncGet<Report>(`${STORAGE_KEYS.REPORT_DETAIL_CACHE_PREFIX}${reportId}`),

  /**
   * Persist a successful detail fetch so the next visit (or a re-visit
   * from Home) re-hydrates instantly while the network round-trip
   * happens in the background.
   */
  saveReportDetailCache: async (reportId: string, report: Report): Promise<void> => {
    await asyncSet(`${STORAGE_KEYS.REPORT_DETAIL_CACHE_PREFIX}${reportId}`, report);
  },

  /**
   * Drop a single report's cached detail — useful when the server tells
   * us the report no longer exists or the user no longer owns it.
   */
  clearReportDetailCache: async (reportId: string): Promise<void> => {
    await asyncRemove(`${STORAGE_KEYS.REPORT_DETAIL_CACHE_PREFIX}${reportId}`);
  },
};
