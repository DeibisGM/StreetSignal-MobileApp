/* eslint-env jest, node */
// Mock AsyncStorage so tests don't hit real storage
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();

  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async key => store.get(key) ?? null),
      setItem: jest.fn(async (key, value) => {
        store.set(key, value);
      }),
      removeItem: jest.fn(async key => {
        store.delete(key);
      }),
      clear: jest.fn(async () => {
        store.clear();
      }),
      getAllKeys: jest.fn(async () => Array.from(store.keys())),
      multiGet: jest.fn(async keys =>
        keys.map(key => [key, store.get(key) ?? null]),
      ),
      multiSet: jest.fn(async entries => {
        for (const [key, value] of entries) {
          store.set(key, value);
        }
      }),
      multiRemove: jest.fn(async keys => {
        for (const key of keys) {
          store.delete(key);
        }
      }),
    },
  };
});

// Mock native notification modules so App tests can render without Android/iOS runtime APIs.
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn().mockResolvedValue('streetsignal_default'),
    requestPermission: jest.fn().mockResolvedValue({authorizationStatus: 1}),
    displayNotification: jest.fn().mockResolvedValue(undefined),
  },
  AndroidImportance: {
    HIGH: 4,
  },
  AuthorizationStatus: {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
}));

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    hasPermission: jest.fn().mockResolvedValue(1),
    isDeviceRegisteredForRemoteMessages: true,
    registerDeviceForRemoteMessages: jest.fn().mockResolvedValue(undefined),
    getToken: jest.fn().mockResolvedValue('mock-fcm-token'),
  })),
  AuthorizationStatus: {
    NOT_DETERMINED: 0,
  },
}));
