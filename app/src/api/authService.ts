import {AuthResponse, User, UserRole} from '../types';
import {storageService} from '../storage';
import {apiClient} from './client';
import {BASE_URL, ENDPOINTS} from './endpoints';
import {sessionManager} from './sessionManager';
import {LoginRequest, RegisterRequest} from './types';

// The backend may send role as a number (0 = citizen, ≥1 = staff) or a string
// with any casing ('staff', 'Staff', 'admin', etc.).
interface RawUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: number | string;
  isActive: boolean;
  createdAt: string;
}

interface RawAuthResponse {
  token: string;
  tokenType?: string;
  expiresIn?: number;
  user: RawUser;
}

function mapRole(raw: number | string): UserRole {
  if (typeof raw === 'string') {
    const lower = raw.toLowerCase();
    return lower === 'staff' || lower === 'admin' ? 'staff' : 'citizen';
  }
  return raw >= 1 ? 'staff' : 'citizen';
}

function mapUser(raw: RawUser): User {
  return {
    id: raw.id,
    fullName: raw.fullName,
    email: raw.email,
    phone: raw.phone,
    role: mapRole(raw.role),
    isActive: raw.isActive,
    createdAt: raw.createdAt,
  };
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const raw = await apiClient.post<RawAuthResponse>(ENDPOINTS.auth.register, data);
    const response: AuthResponse = {token: raw.token, user: mapUser(raw.user)};
    sessionManager.setSession(response.token, response.user);
    storageService.saveSession(response.token, response.user).catch(() => {});
    return response;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const raw = await apiClient.post<RawAuthResponse>(ENDPOINTS.auth.login, data);
    const response: AuthResponse = {token: raw.token, user: mapUser(raw.user)};
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
    const token = sessionManager.getToken();
    sessionManager.clearSession();
    storageService.clearSession().catch(() => {});
    // Best-effort server-side invalidation. Raw fetch (not apiClient) avoids
    // the 401 interceptor triggering a second logout if the server rejects the
    // token, which could race with a fresh login and kick the user out again.
    if (token) {
      fetch(`${BASE_URL}${ENDPOINTS.auth.logout}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
        body: '{}',
      }).catch(() => {});
    }
  },
};
