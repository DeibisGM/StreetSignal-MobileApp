import React from 'react';
import {Alert} from 'react-native';
import {act, fireEvent, render} from '@testing-library/react-native';

import {AuthContext} from '../../../navigation/AuthContext';
import {LanguageProvider} from '../../../i18n';

jest.mock('phosphor-react-native', () => {
  const {View} = require('react-native');
  const Icon = () => <View testID="icon" />;
  return new Proxy({}, {get: () => Icon});
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

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

function renderProfileScreen() {
  const ProfileScreen = require('../screens/ProfileScreen').default;
  return render(
    <LanguageProvider>
      <AuthContext.Provider value={mockAuthValue}>
        <ProfileScreen />
      </AuthContext.Provider>
    </LanguageProvider>,
  );
}

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows user info and role badge', () => {
    const {getByText} = renderProfileScreen();

    expect(getByText('Ana García')).toBeTruthy();
    expect(getByText('ana@test.com')).toBeTruthy();
    expect(getByText('Ciudadano')).toBeTruthy();
  });

  it('shows confirmation before signing out', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const {getByTestId} = renderProfileScreen();

    fireEvent.press(getByTestId('sign-out-button'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Cerrar sesión',
      '¿Seguro que quieres salir de tu cuenta?',
      expect.any(Array),
    );
  });

  it('calls authService.logout through the logout flow', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_, __, buttons) => {
      buttons?.[1]?.onPress?.();
    });

    const {getByTestId} = renderProfileScreen();

    await act(async () => {
      fireEvent.press(getByTestId('sign-out-button'));
    });

    expect(mockAuthValue.logout).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });
});
