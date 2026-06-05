import React from 'react';
import {render} from '@testing-library/react-native';

import {categoriesService} from '../../../api/categoriesService';
import {getCurrentCoords, reverseGeocode} from '../../../api/locationService';

jest.mock('../../../api/reportsService');
jest.mock('../../../api/categoriesService');
jest.mock('../../../api/locationService');
jest.mock('../../../storage/storageService', () => ({
  storageService: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
  STORAGE_KEYS: {
    REPORT_DRAFT: 'ss.report.draft',
    AUTH_TOKEN: 'ss.auth.token',
    AUTH_USER: 'ss.auth.user',
    STAFF_LAST_FILTER: 'ss.staff.lastFilter',
    STAFF_REPORTS_CACHE: 'ss.staff.reports.cache',
  },
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));
jest.mock('phosphor-react-native', () => {
  const {View} = require('react-native');
  const Icon = () => <View testID="icon" />;
  return new Proxy({}, {get: () => Icon});
});

const mockGetCategories = categoriesService.getCategories as jest.Mock;
const mockGetCurrentCoords = getCurrentCoords as jest.Mock;
const mockReverseGeocode = reverseGeocode as jest.Mock;

function renderScreen() {
  const CreateReportScreen = require('../screens/CreateReportScreen').default;
  return render(<CreateReportScreen />);
}

describe('CreateReportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCategories.mockResolvedValue([
      {
        id: 'cat-1',
        name: 'Bache',
        slug: 'bache',
        isActive: true,
      },
    ]);
    mockGetCurrentCoords.mockResolvedValue(null);
    mockReverseGeocode.mockResolvedValue(null);
  });

  it('does not request location when the form opens', () => {
    renderScreen();
    expect(mockGetCurrentCoords).not.toHaveBeenCalled();
  });
});