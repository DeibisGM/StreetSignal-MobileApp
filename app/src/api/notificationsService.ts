import {Notification} from '../types';
import {apiClient} from './client';
import {ENDPOINTS} from './endpoints';
import {RegisterDeviceTokenRequest} from './types';

export const notificationsService = {
  registerDeviceToken: (data: RegisterDeviceTokenRequest): Promise<void> =>
    apiClient.post<void>(ENDPOINTS.notifications.deviceToken, data),

  getNotifications: (): Promise<Notification[]> =>
    apiClient.get<Notification[]>(ENDPOINTS.notifications.list),

  markAsRead: (id: string): Promise<void> =>
    apiClient.patch<void>(ENDPOINTS.notifications.markRead(id), {}),
};
