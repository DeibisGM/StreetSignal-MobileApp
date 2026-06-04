import {authService} from '../../../services/auth/authService';
import {apiClient} from '../../../api/client';

jest.mock('../../../api/client');

const mockedPost = apiClient.post as jest.Mock;

const CITIZEN_RESPONSE = {
  token: 'eyJhbGciOiJIUzI1NiJ9.citizen.signature',
  tokenType: 'Bearer',
  expiresIn: 86400,
  user: {
    id: 'abc-123',
    fullName: 'Ciudadano Test',
    email: 'ciudadano@test.com',
    phone: null,
    role: 0,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
};

const STAFF_RESPONSE = {
  ...CITIZEN_RESPONSE,
  user: {
    ...CITIZEN_RESPONSE.user,
    fullName: 'Funcionario Test',
    email: 'funcionario@test.com',
    role: 1,
  },
};

describe('authService.login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls POST /auth/login with the correct email and password payload', async () => {
    mockedPost.mockResolvedValueOnce(CITIZEN_RESPONSE);

    await authService.login({
      email: 'ciudadano@test.com',
      password: '123456',
    });

    expect(mockedPost).toHaveBeenCalledWith('/auth/login', {
      email: 'ciudadano@test.com',
      password: '123456',
    });
  });

  it('maps numeric role 0 to citizen', async () => {
    mockedPost.mockResolvedValueOnce(CITIZEN_RESPONSE);

    const result = await authService.login({
      email: 'ciudadano@test.com',
      password: '123456',
    });

    expect(result.user.role).toBe('citizen');
  });

  it('maps numeric role 1 to staff', async () => {
    mockedPost.mockResolvedValueOnce(STAFF_RESPONSE);

    const result = await authService.login({
      email: 'funcionario@test.com',
      password: '123456',
    });

    expect(result.user.role).toBe('staff');
  });

  it('returns token from server response', async () => {
    mockedPost.mockResolvedValueOnce(CITIZEN_RESPONSE);

    const result = await authService.login({
      email: 'ciudadano@test.com',
      password: '123456',
    });

    expect(result.token).toBe(CITIZEN_RESPONSE.token);
  });

  it('propagates errors from the API client', async () => {
    mockedPost.mockRejectedValueOnce(new Error('HTTP 401'));

    await expect(
      authService.login({email: 'wrong@test.com', password: 'bad'}),
    ).rejects.toThrow('HTTP 401');
  });
});
