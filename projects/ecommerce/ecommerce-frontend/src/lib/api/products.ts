import api from './axios';
import { Product, PageResponse, Review } from '@/types';

export interface FilterParams {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  name?: string;
  page?: number;
  size?: number;
}

export const productApi = {
  getAll: (page = 0, size = 12, sortBy = 'name', direction = 'asc') =>
    api.get<PageResponse<Product>>('/api/products', {
      params: { page, size, sortBy, direction },
    }).then(r => r.data),

  filter: (params: FilterParams) =>
    api.get<PageResponse<Product>>('/api/products/filter', {
      params,
    }).then(r => r.data),

  getBySlug: (slug: string) =>
    api.get<Product>(`/api/products/${slug}`).then(r => r.data),

  getById: (id: number) =>
    api.get<Product>(`/api/products/${id}`).then(r => r.data),

  search: (name: string) =>
    api.get<Product[]>('/api/products/search', {
      params: { name },
    }).then(r => r.data),

  getReviews: (productId: number) =>
    api.get<Review[]>(`/api/products/${productId}/reviews`).then(r => r.data),

  getAverageRating: (productId: number) =>
    api.get<number>(`/api/products/${productId}/reviews/rating`).then(r => r.data),

  submitReview: (productId: number, data: { rating: number; comment: string }) =>
    api.post<Review>(`/api/products/${productId}/reviews`, data).then(r => r.data),

  // Admin
  create: (data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: number;
  }) => api.post<Product>('/api/products', data).then(r => r.data),

  update: (id: number, data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: number;
  }) => api.put<Product>(`/api/products/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/api/products/${id}`),

  uploadImage: (productId: number, file: File, isPrimary = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', String(isPrimary));
    return api.post(`/api/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};