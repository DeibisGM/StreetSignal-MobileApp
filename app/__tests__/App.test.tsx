/**
 * @format
 */

jest.mock('../src/api/authService', () => ({
  authService: {
    restoreSession: jest.fn().mockResolvedValue(null),
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn(),
    logout: jest.fn(),
  },
}));

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
