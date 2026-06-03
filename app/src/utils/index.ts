import {REPORT_STATUS_LABELS} from '../constants';
import type {ReportStatus} from '../types';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function statusLabel(status: ReportStatus): string {
  return REPORT_STATUS_LABELS[status] ?? status;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
