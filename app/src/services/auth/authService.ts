import {apiClient} from '../../api/client';
import type {AuthResponse, User, UserRole} from '../../types';

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
  tokenType: string;
  expiresIn: number;
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

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const raw = await apiClient.post<RawAuthResponse>('/auth/login', payload);
    return {
      token: raw.token,
      user: mapUser(raw.user),
    };
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const raw = await apiClient.post<RawAuthResponse>('/auth/register', payload);
    return {
      token: raw.token,
      user: mapUser(raw.user),
    };
  },
};
