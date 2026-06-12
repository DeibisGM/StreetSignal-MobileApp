import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';

import {AuthContext} from '../../../navigation/AuthContext';
import {LanguageProvider} from '../../../i18n';
import {notificationsService} from '../../../api/notificationsService';

jest.mock('../../../api/notificationsService');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn()}),
  useFocusEffect: (callback: () => void) => {
    const React = require('react');
    React.useEffect(() => callback(), [callback]);
  },
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));
jest.mock('phosphor-react-native', () => {
  const {View} = require('react-native');
  const Icon = () => <View testID="icon" />;
  return new Proxy({}, {get: () => Icon});
});

const mockGetNotifications = notificationsService.getNotifications as jest.Mock;
const mockMarkAsRead = notificationsService.markAsRead as jest.Mock;

const mockUser = {
  id: 'u1',
  fullName: 'Ana García',
  email: 'ana@test.com',
  role: 'citizen' as const,
  isActive: true,
  createdAt: '',
};

const mockAuthValue = {
  isAuthenticated: true,
  user: mockUser,
  login: jest.fn(),
  logout: jest.fn(),
};

function renderScreen() {
  const NotificationsScreen = require('../screens/NotificationsScreen').default;
  return render(
    <LanguageProvider>
      <AuthContext.Provider value={mockAuthValue}>
        <NotificationsScreen />
      </AuthContext.Provider>
    </LanguageProvider>,
  );
}

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    userId: 'u1',
    reportId: 'r1',
    title: 'Estado actualizado',
    message: 'Tu reporte fue marcado como En proceso',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    userId: 'u1',
    reportId: 'r2',
    title: 'Nuevo comentario',
    message: 'Un funcionario ha comentado en tu reporte',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];

describe('NotificationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMarkAsRead.mockResolvedValue(undefined);
  });

  it('shows loading indicator while fetching', () => {
    mockGetNotifications.mockReturnValue(new Promise(() => {}));
    const {getByTestId} = renderScreen();
    expect(getByTestId('notifications-loading')).toBeTruthy();
  });

  it('shows notifications list after load', async () => {
    mockGetNotifications.mockResolvedValue({
      items: MOCK_NOTIFICATIONS,
      page: 1,
      pageSize: 50,
      total: 2,
    });
    const {getByTestId} = renderScreen();
    await waitFor(() => expect(getByTestId('notifications-list')).toBeTruthy(), {timeout: 10000});
    expect(getByTestId('notif-item-n1')).toBeTruthy();
    expect(getByTestId('notif-item-n2')).toBeTruthy();
  }, 15000);

  it('shows empty state when there are no notifications', async () => {
    mockGetNotifications.mockResolvedValue({items: [], page: 1, pageSize: 50, total: 0});
    const {getByTestId} = renderScreen();
    await waitFor(() => expect(getByTestId('notifications-list')).toBeTruthy());
  });

  it('marks all items as read after tapping each one', async () => {
    mockGetNotifications.mockResolvedValue({
      items: MOCK_NOTIFICATIONS,
      page: 1,
      pageSize: 50,
      total: 2,
    });

    const {getByTestId} = renderScreen();
    await waitFor(() => expect(getByTestId('notif-item-n1')).toBeTruthy());

    // Both should show unread dot before tapping
    expect(getByTestId('notif-dot-n1')).toBeTruthy();
    expect(getByTestId('notif-dot-n2')).toBeTruthy();

    // Tap first notification
    await act(async () => {
      fireEvent.press(getByTestId('notif-item-n1'));
    });
    expect(mockMarkAsRead).toHaveBeenCalledWith('n1');

    // Tap second notification
    await act(async () => {
      fireEvent.press(getByTestId('notif-item-n2'));
    });
    expect(mockMarkAsRead).toHaveBeenCalledWith('n2');

    // Both unread dots should be gone
    await waitFor(() => {
      expect(() => getByTestId('notif-dot-n1')).toThrow();
      expect(() => getByTestId('notif-dot-n2')).toThrow();
    });

    expect(mockMarkAsRead).toHaveBeenCalledTimes(2);
  });

  it('shows error message when load fails', async () => {
    mockGetNotifications.mockRejectedValue(new Error('Network error'));
    const {queryByTestId} = renderScreen();
    await waitFor(() => expect(queryByTestId('notifications-loading')).toBeNull());
  });
});
