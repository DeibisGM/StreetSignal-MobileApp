import React from 'react';
import {act, render, waitFor} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import RootNavigator from '../RootNavigator';

jest.mock('../../api/authService', () => ({
  authService: {
    restoreSession: jest.fn(),
  },
}));

jest.mock('../../storage', () => ({
  storageService: {
    clearSession: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../api/sessionManager', () => ({
  sessionManager: {
    clearSession: jest.fn(),
    setUnauthorizedHandler: jest.fn(),
  },
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    SafeAreaView: ({children, ...props}: React.ComponentProps<typeof View>) => (
      <View {...props}>{children}</View>
    ),
  };
});

jest.mock('../AuthNavigator', () => {
  const {View} = require('react-native');
  return function MockAuthNavigator() {
    return <View testID="auth-navigator" />;
  };
});

jest.mock('../AppNavigator', () => {
  const {View} = require('react-native');
  return function MockAppNavigator() {
    return <View testID="app-navigator" />;
  };
});

import {authService} from '../../api/authService';
import {sessionManager} from '../../api/sessionManager';
import {storageService} from '../../storage';

const mockRestoreSession = authService.restoreSession as jest.Mock;

const mockUser = {
  id: '1',
  fullName: 'Test User',
  email: 'test@example.com',
  role: 'citizen' as const,
  isActive: true,
  createdAt: '',
};

function renderRoot() {
  return render(
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>,
  );
}

describe('RootNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows SplashScreen while session is being restored', () => {
    mockRestoreSession.mockReturnValue(new Promise(() => {}));
    const {getByTestId} = renderRoot();
    expect(getByTestId('splash-screen')).toBeTruthy();
  });

  it('renders AppNavigator when restoreSession succeeds', async () => {
    mockRestoreSession.mockResolvedValue({token: 'tok_123', user: mockUser});
    const {getByTestId} = renderRoot();
    await waitFor(() => {
      expect(getByTestId('app-navigator')).toBeTruthy();
    });
  });

  it('renders AuthNavigator when there is no stored session', async () => {
    mockRestoreSession.mockResolvedValue(null);
    const {getByTestId} = renderRoot();
    await waitFor(() => {
      expect(getByTestId('auth-navigator')).toBeTruthy();
    });
    expect(sessionManager.clearSession).toHaveBeenCalled();
    expect(storageService.clearSession).toHaveBeenCalled();
  });

  it('clears session and renders AuthNavigator when restoreSession rejects', async () => {
    mockRestoreSession.mockRejectedValue(new Error('token expired'));
    const {getByTestId} = renderRoot();
    await waitFor(() => {
      expect(getByTestId('auth-navigator')).toBeTruthy();
    });
    expect(sessionManager.clearSession).toHaveBeenCalled();
    expect(storageService.clearSession).toHaveBeenCalled();
  });

  it('renders AuthNavigator after 3s timeout when restoreSession hangs', async () => {
    jest.useFakeTimers();
    mockRestoreSession.mockReturnValue(new Promise(() => {}));

    const {getByTestId} = renderRoot();
    expect(getByTestId('splash-screen')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(3_000);
    });

    expect(getByTestId('auth-navigator')).toBeTruthy();
    jest.useRealTimers();
  });
});
