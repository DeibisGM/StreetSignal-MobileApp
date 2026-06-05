import {storageService, STORAGE_KEYS} from '../storageService';
import {User} from '../../types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

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
  it('stores token and user fields in AsyncStorage', async () => {
    mockStorage.setItem.mockResolvedValue(undefined);

    await storageService.saveSession('my.jwt.token', fakeUser);

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.AUTH_TOKEN,
      JSON.stringify('my.jwt.token'),
    );
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.AUTH_USER,
      JSON.stringify({
        id: fakeUser.id,
        fullName: fakeUser.fullName,
        email: fakeUser.email,
        role: fakeUser.role,
      }),
    );
    expect(mockStorage.setItem).toHaveBeenCalledTimes(2);
  });
});

// --- loadSession ---------------------------------------------------------

describe('loadSession', () => {
  it('returns the session when token and user are present', async () => {
    mockStorage.getItem
      .mockResolvedValueOnce(JSON.stringify('my.jwt.token'))
      .mockResolvedValueOnce(
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
    mockStorage.getItem.mockResolvedValueOnce(null);

    const session = await storageService.loadSession();

    expect(session).toBeNull();
    expect(mockStorage.getItem).toHaveBeenCalledTimes(1);
  });

  it('returns null when token exists but user data is missing', async () => {
    mockStorage.getItem
      .mockResolvedValueOnce(JSON.stringify('my.jwt.token'))
      .mockResolvedValueOnce(null);

    const session = await storageService.loadSession();

    expect(session).toBeNull();
  });
});

// --- clearSession --------------------------------------------------------

describe('clearSession', () => {
  it('removes all four persisted keys', async () => {
    mockStorage.removeItem.mockResolvedValue(undefined);

    await storageService.clearSession();

    expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_USER);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.STAFF_LAST_FILTER);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.REPORT_DRAFT);
    expect(mockStorage.removeItem).toHaveBeenCalledTimes(4);
  });
});

// --- Generic getItem / setItem / removeItem ------------------------------

describe('getItem', () => {
  it('parses JSON from AsyncStorage', async () => {
    const draft = {title: 'Pothole', description: 'Big one', categoryId: 2};
    mockStorage.getItem.mockResolvedValueOnce(JSON.stringify(draft));

    const result = await storageService.getItem<typeof draft>(STORAGE_KEYS.REPORT_DRAFT);

    expect(result).toEqual(draft);
  });

  it('returns null when key is not found', async () => {
    mockStorage.getItem.mockResolvedValueOnce(null);

    const result = await storageService.getItem(STORAGE_KEYS.REPORT_DRAFT);

    expect(result).toBeNull();
  });
});

describe('setItem', () => {
  it('serialises the value and writes to AsyncStorage', async () => {
    mockStorage.setItem.mockResolvedValueOnce(undefined);
    const filter = {status: 'Pending' as const, categoryId: 3};

    await storageService.setItem(STORAGE_KEYS.STAFF_LAST_FILTER, filter);

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.STAFF_LAST_FILTER,
      JSON.stringify(filter),
    );
  });
});

describe('removeItem', () => {
  it('calls AsyncStorage.removeItem with the given key', async () => {
    mockStorage.removeItem.mockResolvedValueOnce(undefined);

    await storageService.removeItem(STORAGE_KEYS.REPORT_DRAFT);

    expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.REPORT_DRAFT);
  });
});
