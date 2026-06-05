import {ReportStatus, ReportUpdateType} from '../types';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// --- Auth DTOs ---
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// --- Report DTOs ---
export interface CreateReportRequest {
  title: string;
  description: string;
  categoryId: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  imageUrl?: string;
}

export interface UpdateReportRequest {
  title?: string;
  description?: string;
}

export interface UpdateReportStatusRequest {
  status: ReportStatus;
  message?: string;
}

export interface StaffReportFilters {
  status?: ReportStatus;
  categoryId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// --- Report Update DTOs ---
export interface CreateReportUpdateRequest {
  updateType: ReportUpdateType;
  message: string;
  newStatus?: ReportStatus;
}

// --- Notification DTOs ---
export interface RegisterDeviceTokenRequest {
  token: string;
  platform: 'ios' | 'android';
}

// --- File DTOs ---
export interface UploadFileResponse {
  url: string;
  fileName: string;
}
