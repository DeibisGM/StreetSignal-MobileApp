import { Platform } from 'react-native';

function getDevApiBaseUrl(): string {
  if (Platform.OS === 'android') {
    return 'http://192.168.0.213:5000/api';
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  return 'http://localhost:5000/api';
}

// Bare React Native does not inject Expo-style env vars by default.
// Android uses adb reverse: adb reverse tcp:5000 tcp:5000.
export const API_BASE_URL = getDevApiBaseUrl();

export const REPORT_STATUSES = [
  'Pending',
  'InReview',
  'Assigned',
  'InProgress',
  'Resolved',
  'Rejected',
] as const;

export const REPORT_STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  InReview: 'En revision',
  Assigned: 'Asignado',
  InProgress: 'En proceso',
  Resolved: 'Resuelto',
  Rejected: 'Rechazado',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@streetsignal/auth_token',
  CURRENT_USER: '@streetsignal/current_user',
  LAST_FILTER: '@streetsignal/last_filter',
  REPORT_DRAFT: '@streetsignal/report_draft',
  CACHED_REPORTS: '@streetsignal/cached_reports',
} as const;
