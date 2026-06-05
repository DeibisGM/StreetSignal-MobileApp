import {PaginatedResponse, Report, ReportUpdate} from '../types';
import {apiClient} from './client';
import {ENDPOINTS} from './endpoints';
import {
  CreateReportRequest,
  CreateReportUpdateRequest,
  StaffReportFilters,
  UpdateReportRequest,
  UpdateReportStatusRequest,
} from './types';

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

export const reportsService = {
  getMyReports: (): Promise<PaginatedResponse<Report>> =>
    apiClient.get<PaginatedResponse<Report>>(ENDPOINTS.reports.mine),

  getReports: (filters?: StaffReportFilters): Promise<PaginatedResponse<Report>> => {
    const qs = filters
      ? toQueryString(filters as Record<string, unknown>)
      : '';
    return apiClient.get<PaginatedResponse<Report>>(
      `${ENDPOINTS.reports.list}${qs}`,
    );
  },

  getReport: (id: string): Promise<Report> =>
    apiClient.get<Report>(ENDPOINTS.reports.detail(id)),

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

  updateReportStatus: (
    id: string,
    data: UpdateReportStatusRequest,
  ): Promise<Report> =>
    apiClient.patch<Report>(ENDPOINTS.reports.updateStatus(id), data),

  getReportUpdates: (id: string): Promise<ReportUpdate[]> =>
    apiClient.get<ReportUpdate[]>(ENDPOINTS.reports.updates(id)),

  addReportUpdate: (
    id: string,
    data: CreateReportUpdateRequest,
  ): Promise<ReportUpdate> =>
    apiClient.post<ReportUpdate>(ENDPOINTS.reports.addUpdate(id), data),
};
