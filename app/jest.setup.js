// Mock AsyncStorage so tests don't hit real storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock sessionManager to prevent real session access during tests
jest.mock('./src/api/sessionManager', () => ({
  sessionManager: {
    getToken: jest.fn(() => null),
    getUser: jest.fn(() => null),
    setSession: jest.fn(),
    clearSession: jest.fn(),
    notifyUnauthorized: jest.fn(),
    setUnauthorizedHandler: jest.fn(),
  },
}));

// Mock authService to prevent network calls
jest.mock('./src/api/authService', () => ({
  authService: {
    restoreSession: jest.fn().mockResolvedValue(null),
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn(),
    logout: jest.fn(),
  },
}));
