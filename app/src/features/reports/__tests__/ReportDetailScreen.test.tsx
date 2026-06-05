import React from 'react';
import {act, fireEvent, render} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {AuthContext} from '../../../navigation/AuthContext';
import {LanguageProvider} from '../../../i18n';
import {reportsService} from '../../../api/reportsService';
import {ApiError} from '../../../api/types';
import {STORAGE_KEYS} from '../../../storage';

jest.mock('../../../api/reportsService');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn(() => true),
    getParent: () => ({navigate: jest.fn()}),
  }),
  useFocusEffect: (cb: () => unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('react').useEffect(cb, []);
  },
  useRoute: () => ({
    key: 'ReportDetail-r1',
    name: 'ReportDetail',
    params: {reportId: 'r1'},
  }),
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

const mockGetReport = reportsService.getReport as jest.Mock;

const fakeOwnerUser = {
  id: 'u1',
  fullName: 'Ana García',
  email: 'ana@test.com',
  role: 'citizen' as const,
  isActive: true,
  createdAt: '',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRoute = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNav = any;

function makeRoute(reportId: string) {
  return {
    key: `ReportDetail-${reportId}`,
    name: 'ReportDetail',
    params: {reportId},
  } as unknown as AnyRoute;
}

function makeNav(goBack = jest.fn()) {
  return {
    navigate: jest.fn(),
    goBack,
    canGoBack: () => true,
    getParent: () => ({navigate: jest.fn()}),
  } as unknown as AnyNav;
}

function renderDetail(opts?: {reportId?: string; goBack?: jest.Mock}) {
  const ReportDetailScreen = require('../screens/ReportDetailScreen').default;
  return render(
    <LanguageProvider>
      <AuthContext.Provider
        value={{
          isAuthenticated: true,
          user: fakeOwnerUser,
          login: jest.fn(),
          logout: jest.fn(),
        }}>
        <ReportDetailScreen
          route={makeRoute(opts?.reportId ?? 'r1')}
          navigation={makeNav(opts?.goBack)}
        />
      </AuthContext.Provider>
    </LanguageProvider>,
  );
}

const baseReport = {
  id: 'r1',
  title: 'Bache en la acera',
  description: 'Bache grande frente al colegio',
  category: 'Infraestructura',
  categoryId: 'cat-1',
  status: 'Pending',
  latitude: 9.9281,
  longitude: -84.0907,
  address: 'San José, CR',
  createdById: 'u1',
  createdByName: 'Ana García',
  imageUrl: undefined,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: undefined,
  resolvedAt: undefined,
  updates: [],
};

describe('ReportDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    // Fake setTimeout so internal timers don't block act().
    jest.useFakeTimers({doNotFake: ['setImmediate', 'nextTick', 'queueMicrotask']});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── Loading / error baseline ───────────────────────────────────────────

  it('shows the loading spinner while the API and cache read are still pending', () => {
    // Both promises hang → the screen never leaves the initial loading
    // state because nothing has resolved yet.
    (AsyncStorage.getItem as jest.Mock).mockReturnValue(new Promise(() => {}));
    mockGetReport.mockReturnValue(new Promise(() => {}));

    const {getByTestId} = renderDetail();
    expect(getByTestId('report-detail-loading')).toBeTruthy();
  });

  it('shows the error state with retry when the API fails and no cache exists', async () => {
    mockGetReport.mockRejectedValue(new ApiError('HTTP_500', 'Boom', 500));

    const {getByTestId, queryByTestId} = renderDetail();

    await act(async () => {
      await new Promise<void>(resolve => setImmediate(resolve));
    });

    expect(getByTestId('report-detail-error')).toBeTruthy();
    // No offline banner because there was nothing cached to fall back to.
    expect(queryByTestId('report-detail-offline-banner')).toBeNull();
  });

  // ── Acceptance criterion ──────────────────────────────────────────────
  // "A test validates that the timeline renders 1 item when the API
  //  returns 1 update."

  it('renders exactly 1 timeline item when the API returns 1 update', async () => {
    const reportWithOneUpdate = {
      ...baseReport,
      updates: [
        {
          id: 'u1',
          reportId: 'r1',
          createdById: 'staff-1',
          createdByName: 'Carlos Mesa',
          type: 'comment' as const,
          message: 'En camino al sitio.',
          isOfficial: true,
          createdAt: '2026-01-17T09:00:00Z',
        },
      ],
    };
    mockGetReport.mockResolvedValueOnce(reportWithOneUpdate);

    const {getByTestId, queryAllByTestId} = renderDetail();

    await act(async () => {
      await new Promise<void>(resolve => setImmediate(resolve));
    });

    // The detail view itself is rendered…
    expect(getByTestId('report-detail-view')).toBeTruthy();
    // …and the timeline contains exactly one item, identified by its
    // `timeline-item-<id>` testID.
    expect(queryAllByTestId('timeline-item-u1')).toHaveLength(1);
  });

  // ── Offline mode ──────────────────────────────────────────────────────

  it('shows the cached detail with the offline banner when the API fails and cache exists', async () => {
    const cached = {
      ...baseReport,
      title: 'Bache en la acera (cacheado)',
    };
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === `${STORAGE_KEYS.REPORT_DETAIL_CACHE_PREFIX}r1`) {
        return Promise.resolve(JSON.stringify(cached));
      }
      return Promise.resolve(null);
    });
    mockGetReport.mockRejectedValue(new ApiError('NETWORK_ERROR', 'offline', 0));

    const {getByTestId, getByText} = renderDetail();

    // The screen sequences cache hydration → API call, so by the time
    // the microtask queue drains the cached view is on screen AND the
    // network call has already rejected, so the offline banner is up.
    await act(async () => {
      await new Promise<void>(resolve => setImmediate(resolve));
    });

    expect(getByText(/Bache en la acera \(cacheado\)/)).toBeTruthy();
    expect(getByTestId('report-detail-offline-banner')).toBeTruthy();
  });

  // ── Permission denied ─────────────────────────────────────────────────

  it('shows the forbidden screen and "Volver a Inicio" when the report belongs to another citizen', async () => {
    const otherUsersReport = {
      ...baseReport,
      id: 'r-other',
      createdById: 'someone-else',
      createdByName: 'Otro Ciudadano',
    };
    mockGetReport.mockResolvedValueOnce(otherUsersReport);

    const {getByTestId, getByText} = renderDetail({reportId: 'r-other'});

    await act(async () => {
      await new Promise<void>(resolve => setImmediate(resolve));
    });

    expect(getByTestId('report-detail-forbidden')).toBeTruthy();
    expect(getByText('No tenés permisos')).toBeTruthy();

    fireEvent.press(getByText('Volver a Inicio'));
  });

  it('treats a 404 from the API as "forbidden" (don\'t reveal whether the report exists)', async () => {
    mockGetReport.mockRejectedValueOnce(new ApiError('HTTP_404', 'NF', 404));

    const {getByTestId} = renderDetail();

    await act(async () => {
      await new Promise<void>(resolve => setImmediate(resolve));
    });

    expect(getByTestId('report-detail-forbidden')).toBeTruthy();
  });

  // ── Cache write-through ───────────────────────────────────────────────

  it('persists the fetched detail to AsyncStorage for instant re-hydration', async () => {
    mockGetReport.mockResolvedValueOnce({...baseReport});

    renderDetail();

    await act(async () => {
      await new Promise<void>(resolve => setImmediate(resolve));
    });

    expect(AsyncStorage.setItem as jest.Mock).toHaveBeenCalledWith(
      `${STORAGE_KEYS.REPORT_DETAIL_CACHE_PREFIX}r1`,
      expect.stringContaining('"id":"r1"'),
    );
  });
});
