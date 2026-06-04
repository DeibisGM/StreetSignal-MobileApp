import {authService} from '../../../services/auth/authService';
import {apiClient} from '../../../api/client';
import {getPasswordStrength} from '../hooks/useRegister';

jest.mock('../../../api/client');

const mockedPost = apiClient.post as jest.Mock;

const REGISTER_RESPONSE = {
  token: 'eyJhbGciOiJIUzI1NiJ9.citizen.signature',
  tokenType: 'Bearer',
  expiresIn: 86400,
  user: {
    id: 'new-user-123',
    fullName: 'Nuevo Ciudadano',
    email: 'nuevo@test.com',
    phone: null,
    role: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
};

const VALID_PAYLOAD = {
  fullName: 'Nuevo Ciudadano',
  email: 'nuevo@test.com',
  password: 'Pass123!',
  confirmPassword: 'Pass123!',
};

describe('authService.register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls POST /auth/register with the correct payload matching RegisterRequest', async () => {
    mockedPost.mockResolvedValueOnce(REGISTER_RESPONSE);

    await authService.register(VALID_PAYLOAD);

    expect(mockedPost).toHaveBeenCalledWith('/auth/register', {
      fullName: 'Nuevo Ciudadano',
      email: 'nuevo@test.com',
      password: 'Pass123!',
      confirmPassword: 'Pass123!',
    });
  });

  it('assigns citizen role to new registered users (role 0 maps to citizen)', async () => {
    mockedPost.mockResolvedValueOnce(REGISTER_RESPONSE);

    const result = await authService.register(VALID_PAYLOAD);

    expect(result.user.role).toBe('citizen');
  });

  it('returns token on successful registration', async () => {
    mockedPost.mockResolvedValueOnce(REGISTER_RESPONSE);

    const result = await authService.register(VALID_PAYLOAD);

    expect(result.token).toBe(REGISTER_RESPONSE.token);
  });

  it('returns mapped user data on successful registration', async () => {
    mockedPost.mockResolvedValueOnce(REGISTER_RESPONSE);

    const result = await authService.register(VALID_PAYLOAD);

    expect(result.user.fullName).toBe('Nuevo Ciudadano');
    expect(result.user.email).toBe('nuevo@test.com');
    expect(result.user.isActive).toBe(true);
  });

  it('propagates 409 error when email already exists', async () => {
    mockedPost.mockRejectedValueOnce(new Error('HTTP 409'));

    await expect(
      authService.register({
        ...VALID_PAYLOAD,
        email: 'ya_registrado@test.com',
      }),
    ).rejects.toThrow('HTTP 409');
  });

  it('propagates 500 server errors', async () => {
    mockedPost.mockRejectedValueOnce(new Error('HTTP 500'));

    await expect(authService.register(VALID_PAYLOAD)).rejects.toThrow(
      'HTTP 500',
    );
  });

  it('propagates network errors', async () => {
    mockedPost.mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(authService.register(VALID_PAYLOAD)).rejects.toThrow(
      'Network request failed',
    );
  });
});

describe('getPasswordStrength', () => {
  it('returns none for empty password', () => {
    expect(getPasswordStrength('')).toBe('none');
  });

  it('returns weak for password shorter than 6 chars', () => {
    expect(getPasswordStrength('ab1')).toBe('weak');
    expect(getPasswordStrength('12345')).toBe('weak');
  });

  it('returns weak for 6+ chars with only one character type', () => {
    expect(getPasswordStrength('abcdef')).toBe('weak');
    expect(getPasswordStrength('123456')).toBe('weak');
  });

  it('returns medium for 6+ chars with 2 character types', () => {
    expect(getPasswordStrength('abc123')).toBe('medium');
    expect(getPasswordStrength('ABCdef')).toBe('medium');
  });

  it('returns strong for 8+ chars with 3+ character types', () => {
    expect(getPasswordStrength('Pass123!')).toBe('strong');
    expect(getPasswordStrength('MyPass1@')).toBe('strong');
  });
});
