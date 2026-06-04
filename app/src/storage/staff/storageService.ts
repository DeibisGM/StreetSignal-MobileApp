import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../constants';
import type {ReportStatus} from '../../types';

export interface StaffLastFilter {
  status?: ReportStatus | 'All';
  categoryId?: string | 'All';
  search?: string;
}

export const staffStorageService = {
  getLastFilter: async (): Promise<StaffLastFilter | null> => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LAST_FILTER);
    return raw ? (JSON.parse(raw) as StaffLastFilter) : null;
  },

  saveLastFilter: async (filter: StaffLastFilter): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_FILTER, JSON.stringify(filter));
  },

  clearLastFilter: async (): Promise<void> => {
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_FILTER);
  },
};
