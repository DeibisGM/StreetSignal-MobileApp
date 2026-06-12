import React from 'react';
import {AppState, AppStateStatus} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Translations} from '../i18n';
import {notificationsService} from '../api/notificationsService';
import {notificationService} from '../services/notificationService';
import {STORAGE_KEYS} from '../constants';
import {formatNotificationForSystem} from '../features/notifications/notificationText';

const POLL_INTERVAL_MS = 60_000;

export function useNotificationPolling(
  isAuthenticated: boolean,
  userId: string | null | undefined,
  t: Translations,
): void {
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = React.useRef<AppStateStatus>(AppState.currentState);
  const pollingRef = React.useRef(false);

  const poll = React.useCallback(async () => {
    if (
      !isAuthenticated ||
      !userId ||
      appStateRef.current !== 'active' ||
      pollingRef.current
    ) {
      return;
    }
    pollingRef.current = true;
    try {
      const response = await notificationsService.getNotifications({
        unreadOnly: true,
        pageSize: 50,
      });
      if (!response.items.length) {
        return;
      }

      const knownKey = `${STORAGE_KEYS.KNOWN_NOTIF_IDS_PREFIX}${userId}`;
      const raw = await AsyncStorage.getItem(knownKey);
      const known = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);

      const fresh = response.items.filter(n => !known.has(n.id));
      for (const n of fresh) {
        const local = formatNotificationForSystem(n, t);
        await notificationService.showLocalNotification(local.title, local.body);
        known.add(n.id);
      }

      if (fresh.length) {
        await AsyncStorage.setItem(knownKey, JSON.stringify([...known]));
      }
    } catch {
      // Polling errors are non-fatal
    } finally {
      pollingRef.current = false;
    }
  }, [isAuthenticated, userId, t]);

  React.useEffect(() => {
    if (!isAuthenticated || !userId) {
      return;
    }

    poll().catch(() => {});

    const subscription = AppState.addEventListener(
      'change',
      (next: AppStateStatus) => {
        appStateRef.current = next;
        if (next === 'active') {
          poll().catch(() => {});
        }
      },
    );

    intervalRef.current = setInterval(() => {
      poll().catch(() => {});
    }, POLL_INTERVAL_MS);

    return () => {
      subscription.remove();
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, userId, poll]);
}
