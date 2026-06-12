import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {notificationsService} from '../api/notificationsService';
import {STORAGE_KEYS} from '../constants';

const CHANNEL_ID = 'streetsignal_default';

let _channelCreated = false;

async function ensureAndroidChannel(): Promise<void> {
  if (_channelCreated || Platform.OS !== 'android') {
    return;
  }
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'StreetSignal',
    importance: AndroidImportance.HIGH,
    vibration: true,
  });
  _channelCreated = true;
}

async function requestPermission(): Promise<boolean> {
  const alreadyAsked = await AsyncStorage.getItem(
    STORAGE_KEYS.NOTIF_PERMISSION_ASKED,
  );
  if (alreadyAsked) {
    return true;
  }
  await AsyncStorage.setItem(STORAGE_KEYS.NOTIF_PERMISSION_ASKED, '1');
  try {
    const settings = await notifee.requestPermission();
    return (
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
    );
  } catch {
    return false;
  }
}

async function showLocalNotification(title: string, body: string): Promise<void> {
  try {
    await ensureAndroidChannel();
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        pressAction: {id: 'default'},
        smallIcon: 'ic_notification',
      },
    });
  } catch {
    // Non-critical — silently ignore
  }
}

async function getDeviceToken(allowPermissionPrompt = false): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const messagingModule = await import('@react-native-firebase/messaging');
    const fcm = messagingModule.default();

    const permission = await fcm.hasPermission();
    if (permission === messagingModule.AuthorizationStatus.NOT_DETERMINED) {
      if (!allowPermissionPrompt) {
        return null;
      }
    }

    if (!fcm.isDeviceRegisteredForRemoteMessages) {
      await fcm.registerDeviceForRemoteMessages();
    }

    const token = await fcm.getToken();
    return token || null;
  } catch {
    return null;
  }
}

async function registerWithServer(allowPermissionPrompt = false): Promise<void> {
  const token = await getDeviceToken(allowPermissionPrompt);
  if (!token) {
    return;
  }
  try {
    await notificationsService.registerDeviceToken({
      token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });
  } catch {
    // Will retry on next app launch
  }
}

export const notificationService = {
  requestPermission,
  showLocalNotification,
  getDeviceToken,
  registerWithServer,
};
