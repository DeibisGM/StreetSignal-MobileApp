import {apiClient} from '../client';
import {buildReportsQueryPath, reportsService} from '../reportsService';

jest.mock('../client');

const mockedGet = apiClient.get as jest.Mock;
const mockedPatch = apiClient.patch as jest.Mock;

const LIST_RESPONSE = {
  data: [
    {
      id: 'report-1',
      title: 'Bache en la acera',
      description: 'Hay un bache grande en la acera principal',
      status: 'Pending',
      priority: 'Medium',
      category: {
        id: 'cat-1',
        name: 'Infraestructura',
      },
      imageUrl: null,
      latitude: 9.9281,
      longitude: -84.0907,
      address: 'San Jose, CR',
      createdBy: {
        id: 'user-1',
        fullName: 'Ciudadano Test',
        role: 0,
      },
      assignedTo: {
        id: 'staff-1',
        fullName: 'Staff Test',
        role: 1,
      },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:10:00Z',
      resolvedAt: null,
    },
  ],
  pagination: {
    page: 1,
    pageSize: 50,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const DETAIL_RESPONSE = {
  data: {
    id: 'report-1',
    title: 'Bache en la acera',
    description: 'Hay un bache grande en la acera principal',
    status: 3,
    priority: 'High',
    category: {
      id: 'cat-1',
      name: 'Infraestructura',
    },
    imageUrl: null,
    latitude: 9.9281,
    longitude: -84.0907,
    address: 'San Jose, CR',
    createdBy: {
      id: 'user-1',
      fullName: 'Funcionario Test',
      role: 1,
    },
    assignedTo: {
      id: 'staff-2',
      fullName: 'Encargado Test',
      role: 1,
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:10:00Z',
    resolvedAt: null,
    updates: [],
  },
};

describe('reportsService.updateReportStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps paginated staff reports into a flat items list', async () => {
    mockedGet.mockResolvedValueOnce(LIST_RESPONSE);

    const result = await reportsService.getReports({page: 1, pageSize: 50});

    expect(mockedGet).toHaveBeenCalledWith('/reports?page=1&pageSize=50');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('report-1');
    expect(result.items[0].category).toBe('Infraestructura');
  });

  it('calls PATCH /reports/{id}/status with status, priority and assignee payload', async () => {
    mockedPatch.mockResolvedValueOnce(DETAIL_RESPONSE);

    const result = await reportsService.updateReportStatus('report-1', {
      newStatus: 'InProgress',
      priority: 'Critical',
      assignedToId: 'staff-2',
      message: 'Working on it',
    });

    expect(mockedPatch).toHaveBeenCalledWith('/reports/report-1/status', {
      newStatus: 3,
      priority: 3,
      assignedToId: 'staff-2',
      message: 'Working on it',
    });
    expect(result.id).toBe('report-1');
    expect(result.status).toBe('InProgress');
  });

  it('builds the staff reports query string from active filters', () => {
    expect(
      buildReportsQueryPath({
        status: 'InReview',
        categoryId: 'cat-2',
        search: 'bache',
        page: 3,
        pageSize: 20,
      }),
    ).toBe('/reports?status=InReview&categoryId=cat-2&search=bache&page=3&pageSize=20');
  });
});
