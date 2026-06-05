import notifee, {AndroidImportance, AuthorizationStatus} from '@notifee/react-native';
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

/**
 * Returns the FCM registration token for this device.
 *
 * To enable this:
 *   1. Create a Firebase project and download google-services.json
 *   2. Place google-services.json in android/app/
 *   3. npm install @react-native-firebase/app @react-native-firebase/messaging
 *   4. In android/build.gradle add:
 *        classpath 'com.google.gms:google-services:4.4.2'
 *   5. In android/app/build.gradle add at the bottom:
 *        apply plugin: 'com.google.gms.google-services'
 *   6. For iOS: download GoogleService-Info.plist, add to ios/ and run pod install
 */
/**
 * Returns null until Firebase is configured.
 * To enable: follow the setup instructions in registerWithServer() below.
 */
async function getDeviceToken(): Promise<string | null> {
  return null;
}

async function registerWithServer(): Promise<void> {
  const token = await getDeviceToken();
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
