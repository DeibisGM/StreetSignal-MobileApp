import {apiClient} from './client';
import {ENDPOINTS} from './endpoints';

export interface StaffUser {
  id: string;
  fullName: string;
}

interface RawStaffUser {
  id: string;
  fullName: string;
}

export const usersService = {
  getStaffUsers: async (): Promise<StaffUser[]> => {
    const response = await apiClient.get<RawStaffUser[]>(ENDPOINTS.users.staff);
    return response.map(user => ({
      id: user.id,
      fullName: user.fullName,
    }));
  },
};
