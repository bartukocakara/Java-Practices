import api from './axios';
import { Product, PageResponse, Review } from '@/types';

export const productApi = {
  getAll: (page = 0, size = 12, sortBy = 'name', direction = 'asc') =>
    api.get<PageResponse<Product>>('/api/products', {
      params: { page, size, sortBy, direction },
    }).then(r => r.data),

  filter: (params: {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    name?: string;
    page?: number;
    size?: number;
  }) => api.get<PageResponse<Product>>('/api/products/filter', { params }).then(r => r.data),

  getById: (id: number) =>
    api.get<Product>(`/api/products/${id}`).then(r => r.data),

  search: (name: string) =>
    api.get<Product[]>('/api/products/search', { params: { name } }).then(r => r.data),

  getReviews: (id: number) =>
    api.get<Review[]>(`/api/products/${id}/reviews`).then(r => r.data),

  getAverageRating: (id: number) =>
    api.get<number>(`/api/products/${id}/reviews/rating`).then(r => r.data),

  submitReview: (id: number, data: { rating: number; comment: string }) =>
    api.post<Review>(`/api/products/${id}/reviews`, data).then(r => r.data),

  // Admin
  create: (data: Partial<Product> & { categoryId: number }) =>
    api.post<Product>('/api/products', data).then(r => r.data),

  update: (id: number, data: Partial<Product> & { categoryId: number }) =>
    api.put<Product>(`/api/products/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/api/products/${id}`),
};