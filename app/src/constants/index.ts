export const API_BASE_URL = 'http://10.0.2.2:5000/api';

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
  InReview: 'En revisión',
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
