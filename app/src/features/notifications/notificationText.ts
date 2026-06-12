import type {Translations} from '../../i18n';
import type {Notification} from '../../types';

function isCommentNotification(title: string): boolean {
  const normalized = title.toLowerCase();
  return normalized.includes('comment') || normalized.includes('coment');
}

function isStatusNotification(title: string): boolean {
  return title.toLowerCase().includes('status');
}

function extractStatus(message: string): string | null {
  const english = message.match(/Your report is now\s+(.+?)(?:\.)?$/i);
  if (english?.[1]) {
    return english[1];
  }
  const spanish = message.match(/Tu reporte cambió a\s+(.+?)(?:\.)?$/i);
  if (spanish?.[1]) {
    return spanish[1];
  }
  return null;
}

function translateStatusLabel(rawStatus: string, t: Translations): string {
  const normalized = rawStatus.trim().toLowerCase();
  if (normalized === 'pending') return t.statusLabels.Pending;
  if (normalized === 'inreview') return t.statusLabels.InReview;
  if (normalized === 'assigned') return t.statusLabels.Assigned;
  if (normalized === 'inprogress') return t.statusLabels.InProgress;
  if (normalized === 'resolved') return t.statusLabels.Resolved;
  if (normalized === 'rejected') return t.statusLabels.Rejected;
  return rawStatus;
}

export function formatNotificationForList(
  notif: Notification,
  t: Translations,
): {title: string; message: string} {
  const title = notif.title.trim();

  if (isCommentNotification(title)) {
    return {
      title: t.notifications.system.commentTitle,
      message: notif.message,
    };
  }

  if (isStatusNotification(title)) {
    const rawStatus = extractStatus(notif.message);
    const statusLabel = rawStatus
      ? translateStatusLabel(rawStatus, t)
      : notif.message;
    return {
      title: t.notifications.system.statusTitle,
      message: t.notifications.system.statusBody(statusLabel),
    };
  }

  return {
    title: notif.title,
    message: notif.message,
  };
}

export function formatNotificationForSystem(
  notif: Notification,
  t: Translations,
): {title: string; body: string} {
  const title = notif.title.trim();

  if (isCommentNotification(title)) {
    return {
      title: t.notifications.system.commentTitle,
      body: t.notifications.system.commentBody,
    };
  }

  if (isStatusNotification(title)) {
    const rawStatus = extractStatus(notif.message);
    const statusLabel = rawStatus
      ? translateStatusLabel(rawStatus, t)
      : notif.message;
    return {
      title: t.notifications.system.statusTitle,
      body: t.notifications.system.statusBody(statusLabel),
    };
  }

  return {
    title: notif.title,
    body: notif.message,
  };
}
