import React from 'react';
import {render, act, fireEvent, waitFor} from '@testing-library/react-native';
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
  });

  /**
   * Waits for the component to settle after mount effects complete.
   * Uses waitFor (polls the tree) so no fake-timer conflicts with RN internals.
   */
  async function flushComponent() {
    await act(async () => {
      await waitFor(() => expect(true).toBe(true));
    });
  }

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
    await flushComponent();
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
    await flushComponent();
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
    await flushComponent();
    expect(getByTestId('home-reports-error')).toBeTruthy();
  });

  // ── Features brought back from PR 91 ────────────────────────────────

  it('renders the status filter chips bar (Todos, Pendiente, En revisión, …)', async () => {
    mockGetMyReports.mockResolvedValue({items: [], page: 1, pageSize: 10, total: 0});

    const {getByTestId} = renderHomeScreen();
    await flushComponent();

    // At least the two ends of the chips bar exist.
    expect(getByTestId('home-status-chip-all')).toBeTruthy();
    expect(getByTestId('home-status-chip-Pending')).toBeTruthy();
  });

  it('switches the active filter and re-fetches with the new status', async () => {
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
    await flushComponent();

    mockGetMyReports.mockResolvedValue({items: [], page: 1, pageSize: 10, total: 0});

    await act(async () => {
      fireEvent.press(getByTestId('home-status-chip-InReview'));
    });
    await flushComponent();

    // The most recent call should pass the new status filter.
    const lastCall =
      mockGetMyReports.mock.calls[mockGetMyReports.mock.calls.length - 1][0];
    expect(lastCall).toMatchObject({status: 'InReview', page: 1, pageSize: 10});
  });

  it('shows the floating "+" FAB so the citizen can create a new report', async () => {
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
    await flushComponent();
    expect(getByTestId('home-fab')).toBeTruthy();
  });

  it('hydrates the list from AsyncStorage cache on mount', async () => {
    const cached = [
      {
        id: 'cached-1',
        title: 'Bache del cache',
        description: '',
        category: 'Infraestructura',
        categoryId: 'cat-1',
        status: 'Pending' as const,
        latitude: null,
        longitude: null,
        createdById: 'u1',
        createdByName: 'Ana',
        createdAt: '2025-01-01T00:00:00Z',
      },
    ];
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === '@streetsignal/cached_reports') {
        return Promise.resolve(JSON.stringify(cached));
      }
      return Promise.resolve(null);
    });
    mockGetMyReports.mockReturnValue(new Promise(() => {}));

    const {getByTestId} = renderHomeScreen();
    await flushComponent();

    // The cached item should be on screen even though the API is still pending.
    expect(getByTestId('home-report-card-cached-1')).toBeTruthy();
  });

  // ── Hero / listHeader polish ────────────────────────────────────────

  it('renders the white LogoMark next to the user name in the hero', async () => {
    mockGetMyReports.mockResolvedValue({items: [], page: 1, pageSize: 10, total: 0});

    const {getByTestId, getByText} = renderHomeScreen();
    await flushComponent();

    expect(getByTestId('home-hero-logo')).toBeTruthy();
    // The greeting uses the first name.
    expect(getByText('Ana')).toBeTruthy();
  });

  it('shows the count badge in the "Reportes" list header', async () => {
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
        {
          id: 'r2',
          title: 'Alumbrado',
          description: '',
          category: 'Servicios',
          categoryId: 'cat-2',
          status: 'Resolved',
          latitude: null,
          longitude: null,
          createdById: 'u1',
          createdByName: 'Ana',
          createdAt: '2025-02-01T00:00:00Z',
        },
      ],
      page: 1,
      pageSize: 10,
      total: 2,
    });

    const {getByTestId, getByText} = renderHomeScreen();
    await flushComponent();

    expect(getByTestId('home-reports-count')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('Reportes')).toBeTruthy();
  });
});
