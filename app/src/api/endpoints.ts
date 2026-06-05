// Set EXPO_PUBLIC_API_URL in .env to override per environment.
// Requires babel-plugin-dotenv (or react-native-dotenv) — see api/README.md.
declare const process: {env: Record<string, string | undefined>} | undefined;
const ENV_URL =
  typeof process !== 'undefined'
    ? process?.env.EXPO_PUBLIC_API_URL
    : undefined;

export const BASE_URL = ENV_URL ?? 'http://192.168.100.130:5000/api';

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
