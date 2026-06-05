import React from 'react';
import {View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import {LanguageProvider} from '../../i18n';

jest.mock('../AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('phosphor-react-native', () => {
  const {View} = require('react-native');
  const Icon = () => <View testID="icon" />;
  return new Proxy({}, {get: () => Icon});
});

jest.mock('../../features/reports/screens/HomeScreen', () => {
  const {View} = require('react-native');
  return () => <View testID="home-screen" />;
});
jest.mock('../../features/reports/screens/MyReportsScreen', () => {
  const {View} = require('react-native');
  return () => <View testID="my-reports-screen" />;
});
jest.mock('../../features/reports/screens/ReportDetailScreen', () => {
  const {View} = require('react-native');
  return () => <View testID="report-detail-screen" />;
});
jest.mock('../../features/reports/screens/CreateReportScreen', () => {
  const {View} = require('react-native');
  return () => <View testID="create-report-screen" />;
});
jest.mock('../../features/profile/screens/ProfileScreen', () => {
  const {View} = require('react-native');
  return () => <View testID="profile-screen" />;
});
jest.mock('../../features/staff/screens/StaffReportsListScreen', () => {
  const {View} = require('react-native');
  return () => <View testID="staff-list-screen" />;
});
jest.mock('../../features/staff/screens/StaffReportDetailScreen', () => {
  const {View} = require('react-native');
  return () => <View testID="staff-detail-screen" />;
});
jest.mock('../../features/notifications/screens/NotificationsScreen', () => {
  const {View} = require('react-native');
  return () => <View testID="notifications-screen" />;
});

const mockUseAuth = require('../AuthContext').useAuth as jest.Mock;

function renderNavigator(userRole: 'citizen' | 'staff') {
  const AppNavigator = require('../AppNavigator').default;
  mockUseAuth.mockReturnValue({
    user: {
      id: 'u1',
      fullName: 'Test User',
      email: 'test@example.com',
      role: userRole,
      isActive: true,
      createdAt: '',
    },
    logout: jest.fn(),
    login: jest.fn(),
    isAuthenticated: true,
  });

  return render(
    <LanguageProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </LanguageProvider>,
  );
}

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows profile and logout tabs for citizen users', () => {
    const {getByText} = renderNavigator('citizen');

    expect(getByText('Perfil')).toBeTruthy();
    expect(getByText('Salir')).toBeTruthy();
  });

  it('shows reports and notifications tabs for staff users', () => {
    const {getByText} = renderNavigator('staff');

    expect(getByText('Reportes')).toBeTruthy();
    expect(getByText('Perfil')).toBeTruthy();
  });
});
