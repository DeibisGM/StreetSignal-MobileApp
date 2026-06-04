import {storageService, STORAGE_KEYS} from '../storageService';
import {User} from '../../types';

// --- Mocks ---------------------------------------------------------------

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockKeychain = Keychain as jest.Mocked<typeof Keychain>;

const fakeUser: User = {
  id: 'u1',
  fullName: 'Jane Citizen',
  email: 'jane@example.com',
  role: 'citizen',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

// --- saveSession ---------------------------------------------------------

describe('saveSession', () => {
  it('stores token in Keychain and user fields in AsyncStorage', async () => {
    mockKeychain.setGenericPassword.mockResolvedValueOnce(true as never);
    mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

    await storageService.saveSession('my.jwt.token', fakeUser);

    expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
      'token',
      'my.jwt.token',
      expect.objectContaining({service: 'StreetSignal'}),
    );

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.AUTH_USER,
      JSON.stringify({
        id: fakeUser.id,
        fullName: fakeUser.fullName,
        email: fakeUser.email,
        role: fakeUser.role,
      }),
    );
  });
});

// --- loadSession ---------------------------------------------------------

describe('loadSession', () => {
  it('returns the session when token and user are present', async () => {
    mockKeychain.getGenericPassword.mockResolvedValueOnce({
      username: 'token',
      password: 'my.jwt.token',
      service: 'StreetSignal',
      storage: '',
    } as never);

    mockAsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify({
        id: fakeUser.id,
        fullName: fakeUser.fullName,
        email: fakeUser.email,
        role: fakeUser.role,
      }),
    );

    const session = await storageService.loadSession();

    expect(session).not.toBeNull();
    expect(session?.token).toBe('my.jwt.token');
    expect(session?.user.id).toBe(fakeUser.id);
    expect(session?.user.email).toBe(fakeUser.email);
  });

  it('returns null when no token is stored', async () => {
    mockKeychain.getGenericPassword.mockResolvedValueOnce(false as never);

    const session = await storageService.loadSession();

    expect(session).toBeNull();
    expect(mockAsyncStorage.getItem).not.toHaveBeenCalled();
  });

  it('returns null when token exists but user data is missing', async () => {
    mockKeychain.getGenericPassword.mockResolvedValueOnce({
      username: 'token',
      password: 'my.jwt.token',
      service: 'StreetSignal',
      storage: '',
    } as never);
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const session = await storageService.loadSession();

    expect(session).toBeNull();
  });
});

// --- clearSession --------------------------------------------------------

describe('clearSession', () => {
  it('removes all four persisted keys', async () => {
    mockKeychain.resetGenericPassword.mockResolvedValueOnce(true as never);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);

    await storageService.clearSession();

    expect(mockKeychain.resetGenericPassword).toHaveBeenCalledWith(
      expect.objectContaining({service: 'StreetSignal'}),
    );

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_USER);
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.STAFF_LAST_FILTER);
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.REPORT_DRAFT);

    // 3 AsyncStorage.removeItem calls + 1 Keychain.resetGenericPassword
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledTimes(3);
    expect(mockKeychain.resetGenericPassword).toHaveBeenCalledTimes(1);
  });
});

// --- Generic getItem / setItem / removeItem ------------------------------

describe('getItem', () => {
  it('parses JSON from AsyncStorage', async () => {
    const draft = {title: 'Pothole', description: 'Big one', categoryId: 2};
    mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(draft));

    const result = await storageService.getItem<typeof draft>(STORAGE_KEYS.REPORT_DRAFT);

    expect(result).toEqual(draft);
  });

  it('returns null when key is not found', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const result = await storageService.getItem(STORAGE_KEYS.REPORT_DRAFT);

    expect(result).toBeNull();
  });
});

describe('setItem', () => {
  it('serialises the value and writes to AsyncStorage', async () => {
    mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);
    const filter = {status: 'Pending' as const, categoryId: 3};

    await storageService.setItem(STORAGE_KEYS.STAFF_LAST_FILTER, filter);

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.STAFF_LAST_FILTER,
      JSON.stringify(filter),
    );
  });
});

describe('removeItem', () => {
  it('calls AsyncStorage.removeItem with the given key', async () => {
    mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined);

    await storageService.removeItem(STORAGE_KEYS.REPORT_DRAFT);

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.REPORT_DRAFT);
  });
});
