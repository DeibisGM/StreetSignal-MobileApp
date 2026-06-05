jest.mock('../../storage', () => ({
  storageService: {
    saveSession: jest.fn().mockResolvedValue(undefined),
    clearSession: jest.fn().mockResolvedValue(undefined),
    loadSession: jest.fn(),
  },
}));

jest.mock('../client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('../sessionManager', () => ({
  sessionManager: {
    getToken: jest.fn().mockReturnValue('test-token'),
    setSession: jest.fn(),
    clearSession: jest.fn(),
  },
}));

import {authService} from '../authService';
import {storageService} from '../../storage';
import {sessionManager} from '../sessionManager';
import {apiClient} from '../client';

// Raw backend response (role as number, extra tokenType field)
const RAW_STAFF_LOGIN = {
  token: 'tok-staff',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: {id: 'u1', fullName: 'Ana', email: 'ana@test.com', role: 1, isActive: true, createdAt: ''},
};

const RAW_CITIZEN_LOGIN = {
  token: 'tok-citizen',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: {id: 'u2', fullName: 'Bob', email: 'bob@test.com', role: 0, isActive: true, createdAt: ''},
};

describe('authService.login — role mapping', () => {
  beforeEach(() => jest.clearAllMocks());

  it('maps numeric role 1 to "staff"', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue(RAW_STAFF_LOGIN);
    const result = await authService.login({email: 'ana@test.com', password: 'pw'});
    expect(result.user.role).toBe('staff');
  });

  it('maps numeric role 0 to "citizen"', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue(RAW_CITIZEN_LOGIN);
    const result = await authService.login({email: 'bob@test.com', password: 'pw'});
    expect(result.user.role).toBe('citizen');
  });

  it('maps string role "Staff" to "staff"', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({
      token: 'tok', user: {...RAW_STAFF_LOGIN.user, role: 'Staff'},
    });
    const result = await authService.login({email: 'x@test.com', password: 'pw'});
    expect(result.user.role).toBe('staff');
  });

  it('maps string role "admin" to "staff"', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({
      token: 'tok', user: {...RAW_STAFF_LOGIN.user, role: 'admin'},
    });
    const result = await authService.login({email: 'x@test.com', password: 'pw'});
    expect(result.user.role).toBe('staff');
  });

  it('maps unknown string role to "citizen"', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({
      token: 'tok', user: {...RAW_CITIZEN_LOGIN.user, role: 'viewer'},
    });
    const result = await authService.login({email: 'x@test.com', password: 'pw'});
    expect(result.user.role).toBe('citizen');
  });

  it('saves session with normalized role', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue(RAW_STAFF_LOGIN);
    await authService.login({email: 'ana@test.com', password: 'pw'});
    expect(sessionManager.setSession).toHaveBeenCalledWith(
      'tok-staff',
      expect.objectContaining({role: 'staff'}),
    );
    expect(storageService.saveSession).toHaveBeenCalledWith(
      'tok-staff',
      expect.objectContaining({role: 'staff'}),
    );
  });
});

describe('authService.logout', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(null, {status: 200}));
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('clears in-memory session and storage', async () => {
    await authService.logout();
    expect(sessionManager.clearSession).toHaveBeenCalledTimes(1);
    expect(storageService.clearSession).toHaveBeenCalledTimes(1);
  });

  it('sends best-effort token revocation to the server', async () => {
    await authService.logout();
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/auth/logout'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({Authorization: 'Bearer test-token'}),
      }),
    );
  });

  it('does not call fetch when there is no token', async () => {
    (sessionManager.getToken as jest.Mock).mockReturnValueOnce(null);
    await authService.logout();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(sessionManager.clearSession).toHaveBeenCalledTimes(1);
    expect(storageService.clearSession).toHaveBeenCalledTimes(1);
  });
});
