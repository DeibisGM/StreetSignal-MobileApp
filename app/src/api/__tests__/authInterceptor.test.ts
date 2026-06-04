import {apiClient} from '../client';
import {sessionManager} from '../sessionManager';
import {ApiError} from '../types';
import {User} from '../../types';

const mockFetch = jest.fn<Promise<Partial<Response>>, [string, RequestInit]>();
(globalThis as unknown as {fetch: typeof fetch}).fetch =
  mockFetch as unknown as typeof fetch;

const fakeUser: User = {
  id: '1',
  fullName: 'Test User',
  email: 'test@example.com',
  role: 'citizen',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  mockFetch.mockReset();
  sessionManager.setUnauthorizedHandler(() => {});
  sessionManager.clearSession();
});

describe('AuthInterceptor', () => {
  it('attaches Authorization header when a session token is active', async () => {
    const token = 'eyJ.test.signature';
    sessionManager.setSession(token, fakeUser);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({items: [], page: 1, pageSize: 10, total: 0}),
    });

    await apiClient.get('/reports/my');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0];
    const headers = options.headers as Record<string, string>;
    expect(headers['Authorization']).toBe(`Bearer ${token}`);
  });

  it('omits Authorization header when no session is active', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await apiClient.get('/categories');

    const [, options] = mockFetch.mock.calls[0];
    const headers = options.headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('clears the session and calls the unauthorized handler on 401', async () => {
    sessionManager.setSession('expired.token', fakeUser);
    const unauthorizedHandler = jest.fn();
    sessionManager.setUnauthorizedHandler(unauthorizedHandler);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({code: 'UNAUTHORIZED', message: 'Token expired'}),
    });

    await expect(apiClient.get('/auth/me')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      statusCode: 401,
    });

    expect(sessionManager.getToken()).toBeNull();
    expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
  });

  it('throws a typed ApiError with code and statusCode for 4xx responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({code: 'REPORT_NOT_FOUND', message: 'Report not found'}),
    });

    let thrown: unknown;
    try {
      await apiClient.get('/reports/nonexistent-id');
    } catch (err) {
      thrown = err;
    }

    expect(thrown).toBeInstanceOf(ApiError);
    const apiError = thrown as ApiError;
    expect(apiError.code).toBe('REPORT_NOT_FOUND');
    expect(apiError.statusCode).toBe(404);
    expect(apiError.message).toBe('Report not found');
  });

  it('retries once on network error then throws NETWORK_ERROR', async () => {
    mockFetch
      .mockRejectedValueOnce(new TypeError('Network request failed'))
      .mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(apiClient.get('/categories')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      statusCode: 0,
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 5xx server errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({code: 'INTERNAL_ERROR', message: 'Server error'}),
    });

    await expect(apiClient.get('/categories')).rejects.toMatchObject({
      statusCode: 500,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
