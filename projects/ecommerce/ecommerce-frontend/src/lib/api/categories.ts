import api from './axios';
import { Category, CategoryTree } from '@/types';

export const categoryApi = {
  getAll: () =>
    api.get<Category[]>('/api/categories').then(r => r.data),

  getTree: () =>
    api.get<CategoryTree[]>('/api/categories/tree').then(r => r.data),

  getById: (id: number) =>
    api.get<CategoryTree>(`/api/categories/${id}`).then(r => r.data),
};