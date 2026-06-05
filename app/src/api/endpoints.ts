import {API_BASE_URL} from '../constants';

// EXPO_PUBLIC_API_URL (via react-native-dotenv) takes priority when configured.
// Otherwise falls back to API_BASE_URL from constants/index.ts, which dev-start.bat keeps updated.
declare const process: {env: Record<string, string | undefined>} | undefined;
const ENV_URL =
  typeof process !== 'undefined'
    ? process?.env.EXPO_PUBLIC_API_URL
    : undefined;

export const BASE_URL = ENV_URL ?? API_BASE_URL;

export const ENDPOINTS = {
  health: '/health',

  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
    logout: '/auth/logout',
  },

  categories: '/categories',

  reports: {
    mine: '/reports/my',
    list: '/reports',
    create: '/reports',
    detail: (id: string) => `/reports/${id}`,
    update: (id: string) => `/reports/${id}`,
    updateStatus: (id: string) => `/reports/${id}/status`,
    updates: (id: string) => `/reports/${id}/updates`,
    addUpdate: (id: string) => `/reports/${id}/updates`,
  },

  files: {
    upload: '/files/upload',
  },

  notifications: {
    deviceToken: '/notifications/device-token',
    list: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
  },
} as const;
