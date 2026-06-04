import {AuthResponse, User} from '../types';
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
    return response;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.auth.login,
      data,
    );
    sessionManager.setSession(response.token, response.user);
    return response;
  },

  me: (): Promise<User> => apiClient.get<User>(ENDPOINTS.auth.me),

  logout: (): void => {
    sessionManager.clearSession();
    // Best-effort server-side invalidation — not awaited because JWT is stateless.
    apiClient.post<void>(ENDPOINTS.auth.logout, {}).catch(() => {});
  },
};
