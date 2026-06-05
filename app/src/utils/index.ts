import {REPORT_PRIORITY_LABELS, REPORT_STATUS_LABELS} from '../constants';
import type {ReportPriority, ReportStatus} from '../types';

/**
 * Parse an ISO string ensuring UTC is assumed when no timezone offset is present.
 * Hermes (React Native) is inconsistent about whether bare datetime strings
 * are treated as local or UTC — appending 'Z' makes it explicit.
 */
export function parseUTCDate(iso: string): Date {
  // Already has timezone info (Z, +HH:MM, -HH:MM)
  if (/[Zz]$/.test(iso) || /[+-]\d{2}:\d{2}$/.test(iso)) {
    return new Date(iso);
  }
  return new Date(iso + 'Z');
}

export function formatDate(iso: string): string {
  return parseUTCDate(iso).toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function statusLabel(status: ReportStatus): string {
  return REPORT_STATUS_LABELS[status] ?? status;
}

export function priorityLabel(priority: ReportPriority): string {
  return REPORT_PRIORITY_LABELS[priority] ?? priority;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
