export type UserRole = 'citizen' | 'staff';

export type ReportStatus =
  | 'Pending'
  | 'InReview'
  | 'Assigned'
  | 'InProgress'
  | 'Resolved'
  | 'Rejected';

export type ReportUpdateType = 'comment' | 'status_change' | 'system';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder?: number;
}

export interface ReportImage {
  id: string;
  reportId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  url: string;
  createdAt: string;
}

export interface ReportUpdate {
  id: string;
  reportId: string;
  createdById: string;
  createdByName: string;
  type: ReportUpdateType;
  message: string;
  oldStatus?: ReportStatus;
  newStatus?: ReportStatus;
  isOfficial: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category: string;
  status: ReportStatus;
  latitude: number | null;
  longitude: number | null;
  address?: string;
  createdById: string;
  createdByName: string;
  imageUrl?: string;
  images?: ReportImage[];
  updates?: ReportUpdate[];
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  reportId?: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
