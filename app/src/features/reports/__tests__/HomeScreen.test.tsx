import React from 'react';
import {render, act} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {AuthContext} from '../../../navigation/AuthContext';
import {reportsService} from '../../../api/reportsService';

jest.mock('../../../api/reportsService');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    getParent: () => ({navigate: jest.fn()}),
  }),
  useFocusEffect: (cb: () => unknown) => {
    require('react').useEffect(cb, []);
  },
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));
// Phosphor SVG icons trigger async layout work that blocks act().
jest.mock('phosphor-react-native', () => {
  const {View} = require('react-native');
  const Icon = () => <View testID="icon" />;
  return new Proxy({}, {get: () => Icon});
});

const mockGetMyReports = reportsService.getMyReports as jest.Mock;

const mockAuthValue = {
  isAuthenticated: true,
  user: {
    id: 'u1',
    fullName: 'Ana García',
    email: 'ana@test.com',
    role: 'citizen' as const,
    isActive: true,
    createdAt: '',
  },
  login: jest.fn(),
  logout: jest.fn(),
};

function renderHomeScreen() {
  const HomeScreen = require('../screens/HomeScreen').default;
  return render(
    <AuthContext.Provider value={mockAuthValue}>
      <HomeScreen />
    </AuthContext.Provider>,
  );
}

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    // Fake setTimeout so ScrollView internal timers don't block act().
    jest.useFakeTimers({doNotFake: ['setImmediate', 'nextTick', 'queueMicrotask']});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Acceptance criterion: EmptyState renders when the list is empty.
   */
  it('renders EmptyState when the list is empty', async () => {
    mockGetMyReports.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
    });

    const {getByTestId} = renderHomeScreen();

    await act(async () => {
      await new Promise<void>(resolve => setImmediate(resolve));
    });

    expect(getByTestId('home-empty-state')).toBeTruthy();
  });

  it('renders report cards when reports are present', async () => {
    mockGetMyReports.mockResolvedValue({
      items: [
        {
          id: 'r1',
          title: 'Bache',
          description: '',
          category: 'Infraestructura',
          categoryId: 'cat-1',
          status: 'Pending',
          latitude: null,
          longitude: null,
          createdById: 'u1',
          createdByName: 'Ana',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ],
      page: 1,
      pageSize: 10,
      total: 1,
    });

    const {getByTestId} = renderHomeScreen();

    await act(async () => {
      await new Promise<void>(resolve => setImmediate(resolve));
    });

    expect(getByTestId('home-report-card-r1')).toBeTruthy();
  });

  it('shows loading indicator while fetching', () => {
    mockGetMyReports.mockReturnValue(new Promise(() => {}));
    const {getByTestId} = renderHomeScreen();
    expect(getByTestId('home-reports-loading')).toBeTruthy();
  });

  it('shows error state when fetch fails', async () => {
    mockGetMyReports.mockRejectedValue(new Error('Network error'));

    const {getByTestId} = renderHomeScreen();

    await act(async () => {
      await new Promise<void>(resolve => setImmediate(resolve));
    });

    expect(getByTestId('home-reports-error')).toBeTruthy();
  });
});
