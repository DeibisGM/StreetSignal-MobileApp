import {AuthResponse, User} from '../types';
import {storageService} from '../storage';
import {apiClient} from './client';
import {ENDPOINTS} from './endpoints';
import {sessionManager} from './sessionManager';
import {LoginRequest, RegisterRequest} from './types';

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.auth.register,
      data,
    );
    sessionManager.setSession(response.token, response.user);
    storageService.saveSession(response.token, response.user).catch(() => {});
    return response;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.auth.login,
      data,
    );
    sessionManager.setSession(response.token, response.user);
    storageService.saveSession(response.token, response.user).catch(() => {});
    return response;
  },

  me: (): Promise<User> => apiClient.get<User>(ENDPOINTS.auth.me),

  // Restores the stored session without calling /auth/me.
  // Trusting the stored token avoids the race condition where a background
  // /auth/me returning 401 (expired old token) triggers logout while the
  // user is already authenticated with a fresh token.
  // If the token IS expired, the first protected API call will return 401
  // and notifyUnauthorized → logout handles it naturally.
  restoreSession: async (): Promise<{token: string; user: User} | null> => {
    const session = await storageService.loadSession();
    if (!session) return null;
    sessionManager.setSession(session.token, session.user);
    return session;
  },

  logout: (): void => {
    sessionManager.clearSession();
    storageService.clearSession().catch(() => {});
    // Best-effort server-side invalidation — not awaited because JWT is stateless.
    apiClient.post<void>(ENDPOINTS.auth.logout, {}).catch(() => {});
  },
};
