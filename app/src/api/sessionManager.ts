import {User} from '../types';

let _token: string | null = null;
let _user: User | null = null;
let _unauthorizedHandler: (() => void) | null = null;

export const sessionManager = {
  getToken: (): string | null => _token,

  getUser: (): User | null => _user,

  setSession: (token: string, user: User): void => {
    _token = token;
    _user = user;
  },

  clearSession: (): void => {
    _token = null;
    _user = null;
  },

  // Called on 401: clears the session and triggers navigation to Login.
  notifyUnauthorized: (): void => {
    _token = null;
    _user = null;
    _unauthorizedHandler?.();
  },

  // Register a callback (e.g. navigate to Login screen) invoked on 401 responses.
  setUnauthorizedHandler: (handler: () => void): void => {
    _unauthorizedHandler = handler;
  },
};
