import {Category} from '../types';
import {apiClient} from './client';
import {ENDPOINTS} from './endpoints';

export const categoriesService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<{data: Category[]}>(ENDPOINTS.categories);
    return response.data ?? [];
  },
};
