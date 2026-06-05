import {Category} from '../types';
import {apiClient} from './client';
import {ENDPOINTS} from './endpoints';

// The API wraps collection responses in an envelope: { data: Category[] }.
// Unwrap defensively so callers always receive a plain array, never an object
// (rendering a non-array with .map() crashes the screen).
export const categoriesService = {
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<Category[] | {data: Category[]}>(
      ENDPOINTS.categories,
    );
    const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    // Sort by sortOrder when available (exposed by backend), keeping "otro" last.
    return [...items].sort((a, b) => {
      const ao = a.sortOrder ?? (a.slug === 'otro' ? 999 : 500);
      const bo = b.sortOrder ?? (b.slug === 'otro' ? 999 : 500);
      return ao !== bo ? ao - bo : a.name.localeCompare(b.name);
    });
  },
};
