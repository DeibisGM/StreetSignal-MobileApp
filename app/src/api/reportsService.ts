import {PaginatedResponse, Report, ReportStatus, ReportUpdate, ReportUpdateType, UserRole} from '../types';
import {apiClient} from './client';
import {ENDPOINTS} from './endpoints';
import {
  CreateReportRequest,
  CreateReportUpdateRequest,
  StaffReportFilters,
  UpdateReportRequest,
  UpdateReportStatusRequest,
} from './types';

const REPORT_STATUSES: ReportStatus[] = [
  'Pending',
  'InReview',
  'Assigned',
  'InProgress',
  'Resolved',
  'Rejected',
];

type RawUserRole = number | string;
type RawReportStatus = number | string;
type RawReportUpdateType = number | string;

interface RawUserBasicDto {
  id: string;
  fullName: string;
  role: RawUserRole;
}

interface RawCategoryDto {
  id: string;
  name: string;
}

interface RawReportUpdateDto {
  id: string;
  reportId: string;
  user: RawUserBasicDto;
  type: RawReportUpdateType;
  message: string;
  isOfficial?: boolean;
  oldStatus?: RawReportStatus | null;
  newStatus?: RawReportStatus | null;
  createdAt: string;
}

interface RawReportSummaryDto {
  id: string;
  title: string;
  description?: string | null;
  status: RawReportStatus;
  category: RawCategoryDto;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  createdBy: RawUserBasicDto;
  createdAt: string;
  updatedAt?: string | null;
  resolvedAt?: string | null;
  updates?: RawReportUpdateDto[];
}

interface RawReportDetailResponse {
  data: RawReportSummaryDto;
}

interface RawPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface RawPaginatedReportListResponse {
  data: RawReportSummaryDto[];
  pagination: RawPaginationMeta;
}

interface RawReportUpdateResponse {
  data: RawReportUpdateDto;
}

interface RawReportUpdateListResponse {
  data: RawReportUpdateDto[];
}

function mapRole(raw: RawUserRole): UserRole {
  if (typeof raw === 'string') {
    const lower = raw.toLowerCase();
    return lower === 'staff' || lower === 'admin' ? 'staff' : 'citizen';
  }
  return raw >= 1 ? 'staff' : 'citizen';
}

function mapStatus(raw: RawReportStatus): ReportStatus {
  if (typeof raw === 'string') {
    const lower = raw.trim().toLowerCase();
    const byName = REPORT_STATUSES.find(
      status => status.toLowerCase() === lower,
    );
    if (byName) {
      return byName;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      return REPORT_STATUSES[parsed] ?? 'Pending';
    }
    return 'Pending';
  }

  return REPORT_STATUSES[raw] ?? 'Pending';
}

function mapStatusToApi(status: ReportStatus): number {
  return Math.max(0, REPORT_STATUSES.indexOf(status));
}

function mapUpdateType(raw: RawReportUpdateType): ReportUpdateType {
  if (typeof raw === 'string') {
    const lower = raw.trim().toLowerCase();
    if (lower === 'comment') {
      return 'comment';
    }
    if (lower === 'status_change' || lower === 'statuschange') {
      return 'status_change';
    }
    return 'system';
  }

  if (raw === 0) {
    return 'comment';
  }
  if (raw === 1) {
    return 'status_change';
  }
  return 'system';
}

function mapUser(raw: RawUserBasicDto): {id: string; fullName: string; role: UserRole} {
  return {
    id: raw.id,
    fullName: raw.fullName,
    role: mapRole(raw.role),
  };
}

function mapUpdate(raw: RawReportUpdateDto): ReportUpdate {
  const user = mapUser(raw.user);
  const type = mapUpdateType(raw.type);

  return {
    id: raw.id,
    reportId: raw.reportId,
    createdById: user.id,
    createdByName: user.fullName,
    type,
    message: raw.message,
    oldStatus: raw.oldStatus !== undefined && raw.oldStatus !== null ? mapStatus(raw.oldStatus) : undefined,
    newStatus: raw.newStatus !== undefined && raw.newStatus !== null ? mapStatus(raw.newStatus) : undefined,
    isOfficial: raw.isOfficial ?? (type !== 'comment' || user.role !== 'citizen'),
    createdAt: raw.createdAt,
  };
}

function mapReport(raw: RawReportSummaryDto): Report {
  const createdBy = mapUser(raw.createdBy);
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? '',
    categoryId: '',
    category: raw.category?.name ?? '',
    status: mapStatus(raw.status),
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
    address: raw.address ?? undefined,
    createdById: createdBy.id,
    createdByName: createdBy.fullName,
    imageUrl: raw.imageUrl ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? undefined,
    resolvedAt: raw.resolvedAt ?? undefined,
    updates: raw.updates?.map(mapUpdate),
  };
}

function mapPaginatedReports(raw: RawPaginatedReportListResponse): PaginatedResponse<Report> {
  return {
    items: raw.data.map(mapReport),
    page: raw.pagination.page,
    pageSize: raw.pagination.pageSize,
    total: raw.pagination.totalItems,
  };
}

function mapStatusRequest(data: UpdateReportStatusRequest) {
  return {
    newStatus: mapStatusToApi(data.newStatus),
    message: data.message,
  };
}

function toQueryString(params: Record<string, unknown>): string {
  const pairs = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null,
  );
  if (!pairs.length) {
    return '';
  }
  return (
    '?' +
    pairs
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      )
      .join('&')
  );
}

export function buildReportsQueryPath(filters?: StaffReportFilters): string {
  const qs = filters ? toQueryString(filters as Record<string, unknown>) : '';
  return `${ENDPOINTS.reports.list}${qs}`;
}

export const reportsService = {
  getMyReports: async (params?: {
    page?: number;
    pageSize?: number;
    status?: ReportStatus;
  }): Promise<PaginatedResponse<Report>> => {
    const qs = params ? toQueryString(params as Record<string, unknown>) : '';
    const response = await apiClient.get<RawPaginatedReportListResponse>(
      `${ENDPOINTS.reports.mine}${qs}`,
    );
    return mapPaginatedReports(response);
  },

  getReports: async (filters?: StaffReportFilters): Promise<PaginatedResponse<Report>> => {
    const response = await apiClient.get<RawPaginatedReportListResponse>(
      buildReportsQueryPath(filters),
    );
    return mapPaginatedReports(response);
  },

  getReport: async (id: string): Promise<Report> => {
    const response = await apiClient.get<RawReportDetailResponse>(
      ENDPOINTS.reports.detail(id),
    );
    return mapReport(response.data);
  },

  createReport: (data: CreateReportRequest): Promise<Report> => {
    return apiClient.post<Report>(ENDPOINTS.reports.create, {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address ?? null,
      imageUrl: data.imageUrl ?? null,
    });
  },

  updateReport: (id: string, data: UpdateReportRequest): Promise<Report> =>
    apiClient.patch<Report>(ENDPOINTS.reports.update(id), data),

  updateReportStatus: async (
    id: string,
    data: UpdateReportStatusRequest,
  ): Promise<Report> => {
    const response = await apiClient.patch<RawReportDetailResponse>(
      ENDPOINTS.reports.updateStatus(id),
      mapStatusRequest(data),
    );
    return mapReport(response.data);
  },

  getReportUpdates: async (id: string): Promise<ReportUpdate[]> => {
    const response = await apiClient.get<RawReportUpdateListResponse>(
      ENDPOINTS.reports.updates(id),
    );
    return response.data.map(mapUpdate);
  },

  addReportUpdate: async (
    id: string,
    data: CreateReportUpdateRequest,
  ): Promise<ReportUpdate> => {
    const response = await apiClient.post<RawReportUpdateResponse>(
      ENDPOINTS.reports.addUpdate(id),
      data,
    );
    return mapUpdate(response.data);
  },
};
