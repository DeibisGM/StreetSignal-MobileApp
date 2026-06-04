import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import RootNavigator from '../RootNavigator';

// Mock storage and session modules
jest.mock('../../storage', () => ({
  storageService: {
    loadSession: jest.fn(),
    clearSession: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../api/sessionManager', () => ({
  sessionManager: {
    setSession: jest.fn(),
    clearSession: jest.fn(),
    setUnauthorizedHandler: jest.fn(),
  },
}));

// Mock navigators to keep the test lightweight
jest.mock('../AuthNavigator', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockAuthNavigator() {
    return <View testID="auth-navigator" />;
  };
});

jest.mock('../AppNavigator', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockAppNavigator() {
    return <View testID="app-navigator" />;
  };
});

import {storageService} from '../../storage';
import {sessionManager} from '../../api/sessionManager';

const mockLoadSession = storageService.loadSession as jest.Mock;
const mockSetSession = sessionManager.setSession as jest.Mock;

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

  it('renders AuthNavigator when there is no stored session', async () => {
    mockLoadSession.mockResolvedValue(null);

    const {getByTestId} = renderRoot();

    await waitFor(() => {
      expect(getByTestId('auth-navigator')).toBeTruthy();
    });
    expect(mockSetSession).not.toHaveBeenCalled();
  });

  it('renders AppNavigator when a valid session is found in storage', async () => {
    mockLoadSession.mockResolvedValue({
      token: 'tok_123',
      user: {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'citizen',
        isActive: true,
        createdAt: '',
      },
    });

    const {getByTestId} = renderRoot();

    await waitFor(() => {
      expect(getByTestId('app-navigator')).toBeTruthy();
    });
    expect(mockSetSession).toHaveBeenCalledWith('tok_123', expect.objectContaining({role: 'citizen'}));
  });

  it('renders AuthNavigator when loadSession rejects', async () => {
    mockLoadSession.mockRejectedValue(new Error('storage error'));

    const {getByTestId} = renderRoot();

    await waitFor(() => {
      expect(getByTestId('auth-navigator')).toBeTruthy();
    });
  });
});
