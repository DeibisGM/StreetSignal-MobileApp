import React from 'react';
import {AppState, AppStateStatus} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {notificationsService} from '../api/notificationsService';
import {notificationService} from '../services/notificationService';
import {STORAGE_KEYS} from '../constants';

const POLL_INTERVAL_MS = 90_000;

export function useNotificationPolling(isAuthenticated: boolean): void {
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = React.useRef<AppStateStatus>(AppState.currentState);
  const pollingRef = React.useRef(false);

  const poll = React.useCallback(async () => {
    if (!isAuthenticated || appStateRef.current !== 'active' || pollingRef.current) {
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

      const raw = await AsyncStorage.getItem(STORAGE_KEYS.KNOWN_NOTIF_IDS);
      const known = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);

      const fresh = response.items.filter(n => !known.has(n.id));
      for (const n of fresh) {
        await notificationService.showLocalNotification(n.title, n.message);
        known.add(n.id);
      }

      if (fresh.length) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.KNOWN_NOTIF_IDS,
          JSON.stringify([...known]),
        );
      }
    } catch {
      // Polling errors are non-fatal
    } finally {
      pollingRef.current = false;
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

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
      }
    };
  }, [isAuthenticated, poll]);
}
