import {Category} from '../types';
import {apiClient} from './client';
import {ENDPOINTS} from './endpoints';

export const categoriesService = {
  getCategories: (): Promise<Category[]> =>
    apiClient.get<Category[]>(ENDPOINTS.categories),
};
