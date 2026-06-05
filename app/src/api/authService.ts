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

  // Validates the stored token against GET /auth/me.
  // Returns the fresh session on success, null if no token is stored.
  // Throws on API error (expired, invalid, network failure) — caller handles cleanup.
  restoreSession: async (): Promise<{token: string; user: User} | null> => {
    const session = await storageService.loadSession();
    console.log('[restoreSession] session from storage:', session ? 'found' : 'null');
    if (!session) return null;
    sessionManager.setSession(session.token, session.user);
    const user = await apiClient.get<User>(ENDPOINTS.auth.me);
    sessionManager.setSession(session.token, user);
    storageService.saveSession(session.token, user).catch(() => {});
    return {token: session.token, user};
  },

  logout: (): void => {
    sessionManager.clearSession();
    storageService.clearSession().catch(() => {});
    // Best-effort server-side invalidation — not awaited because JWT is stateless.
    apiClient.post<void>(ENDPOINTS.auth.logout, {}).catch(() => {});
  },
};
