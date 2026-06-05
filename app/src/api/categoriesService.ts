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
    if (Array.isArray(res)) {
      return res;
    }
    return Array.isArray(res?.data) ? res.data : [];
  },
};
