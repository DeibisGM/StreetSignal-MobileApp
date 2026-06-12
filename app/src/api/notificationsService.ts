import {Notification, PaginatedResponse} from '../types';
import {apiClient} from './client';
import {ENDPOINTS} from './endpoints';
import {RegisterDeviceTokenRequest} from './types';

// ── Raw API shapes ────────────────────────────────────────────────────────────

interface RawNotificationDto {
  id: string;
  userId: string;
  reportId?: string | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface RawPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface RawPaginatedNotificationResponse {
  data: RawNotificationDto[];
  pagination: RawPaginationMeta;
}

// ── Mapper ───────────────────────────────────────────────────────────────────

function mapNotification(raw: RawNotificationDto): Notification {
  return {
    id: raw.id,
    userId: raw.userId,
    reportId: raw.reportId ?? undefined,
    title: raw.title,
    message: raw.message,
    isRead: raw.isRead,
    createdAt: raw.createdAt,
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

export const notificationsService = {
  getNotifications: async (params?: {
    unreadOnly?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Notification>> => {
    const qs = params
      ? '?' + Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';
    const raw = await apiClient.get<RawPaginatedNotificationResponse>(
      `${ENDPOINTS.notifications.list}${qs}`,
    );
    return {
      items: raw.data.map(mapNotification),
      page: raw.pagination.page,
      pageSize: raw.pagination.pageSize,
      total: raw.pagination.totalItems,
    };
  },

  registerDeviceToken: (data: RegisterDeviceTokenRequest): Promise<void> =>
    apiClient.post<void>(ENDPOINTS.notifications.deviceToken, data),

  markAsRead: (id: string): Promise<void> =>
    apiClient.patch<void>(ENDPOINTS.notifications.markRead(id), {}),
};
