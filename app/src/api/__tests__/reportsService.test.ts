import {buildQueryString, reportsService} from '../reportsService';
import {apiClient} from '../client';

jest.mock('../client');

const mockedGet = apiClient.get as jest.Mock;

describe('reportsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds a query string from active staff filters', () => {
    expect(
      buildQueryString({
        status: 'InProgress',
        categoryId: 'cat-12',
        search: 'road',
        page: 2,
        pageSize: 10,
      }),
    ).toBe('?status=InProgress&categoryId=cat-12&search=road&page=2&pageSize=10');
  });

  it('omits empty filters from the query string', () => {
    expect(
      buildQueryString({
        status: undefined,
        categoryId: undefined,
        search: '',
        page: 1,
        pageSize: 10,
      }),
    ).toBe('?page=1&pageSize=10');
  });

  it('uses the general reports endpoint for staff list queries', async () => {
    mockedGet.mockResolvedValueOnce({
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    await reportsService.getReports({status: 'Pending', page: 1, pageSize: 10});

    expect(mockedGet).toHaveBeenCalledWith('/reports?status=Pending&page=1&pageSize=10');
  });
});
