import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react-native';

import {reportsService} from '../../../api/reportsService';
import {usersService} from '../../../api/usersService';

jest.mock('../../../api/reportsService');
jest.mock('../../../api/usersService');
jest.mock('../../reports/components/ReportDetailView', () => ({
  ReportDetailView: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('../../../components/StatusBadge', () => ({
  StatusBadge: ({status}: {status: string}) => {
    const {View, Text} = require('react-native');
    return (
      <View testID={`mock-status-badge-${status}`}>
        <Text>{status}</Text>
      </View>
    );
  },
}));
jest.mock('../../../components', () => {
  const actual = jest.requireActual('../../../components');
  return {
    ...actual,
    SuccessToast: () => null,
  };
});
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
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

const mockGetReport = reportsService.getReport as jest.Mock;
const mockUpdateReportStatus = reportsService.updateReportStatus as jest.Mock;
const mockGetStaffUsers = usersService.getStaffUsers as jest.Mock;

function renderScreen() {
  const Screen = require('../screens/StaffReportDetailScreen').default;
  return render(<Screen route={{params: {reportId: 'r1'}}} />);
}

describe('StaffReportDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetReport.mockResolvedValue({
      id: 'r1',
      title: 'Bache',
      description: 'Bache grande',
      categoryId: 'cat-1',
      category: 'Infraestructura',
      status: 'Pending',
      priority: 'Medium',
      latitude: null,
      longitude: null,
      address: undefined,
      createdById: 'citizen-1',
      createdByName: 'Citizen',
      assignedToId: 'staff-1',
      assignedToName: 'Staff One',
      assignedTo: {
        id: 'staff-1',
        fullName: 'Staff One',
        role: 'staff',
      },
      imageUrl: undefined,
      updates: [],
      createdAt: '2026-01-01T00:00:00Z',
    });
    mockGetStaffUsers.mockResolvedValue([
      {id: 'staff-1', fullName: 'Staff One'},
    ]);
    mockUpdateReportStatus.mockResolvedValue({});
  });

  it('sends priority and assignee with the status payload', async () => {
    const {findByTestId, getByTestId} = renderScreen();

    await findByTestId('priority-option-High');
    await findByTestId('staff-option-staff-1');

    fireEvent.press(getByTestId('priority-option-High'));
    fireEvent.press(getByTestId('staff-option-staff-1'));
    fireEvent.changeText(getByTestId('staff-message-input'), 'Asignado y priorizado');
    fireEvent.press(getByTestId('staff-update-button'));

    await waitFor(() => {
      expect(mockUpdateReportStatus).toHaveBeenCalledWith('r1', {
        newStatus: 'Pending',
        priority: 'High',
        assignedToId: 'staff-1',
        message: 'Asignado y priorizado',
      });
    });
  });
});
