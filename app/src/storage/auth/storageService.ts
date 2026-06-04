import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../constants';
import type {User} from '../../types';

export const storageService = {
  saveSession: async (token: string, user: User): Promise<void> => {
    await AsyncStorage.setMany({
      [STORAGE_KEYS.AUTH_TOKEN]: token,
      [STORAGE_KEYS.CURRENT_USER]: JSON.stringify(user),
    });
  },

  getToken: (): Promise<string | null> =>
    AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),

  getUser: async (): Promise<User | null> => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  clearSession: async (): Promise<void> => {
    await AsyncStorage.removeMany([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.CURRENT_USER,
    ]);
  },
};
