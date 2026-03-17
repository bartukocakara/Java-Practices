import api from './axios';
import { Product, ProductVariantResponse, ProductImage } from '@/types';

export interface VendorProductRequest {
  name:        string;
  description: string;
  price:       number;
  stock:       number;
  categoryId:  number;
  status?:     string;
}

export interface CreateVariantRequest {
  sku:                string;
  price:              number;
  stock:              number;
  attributeValueIds?: Record<number, number>;
}

export const vendorProductApi = {
  getAll: (status?: string, lowStock?: boolean) =>
    api.get<Product[]>('/api/vendor/products', {
      params: { status, lowStock }
    }).then(r => r.data),

  getById: (id: number) =>
    api.get<Product>(`/api/vendor/products/${id}`).then(r => r.data),

  create: (data: VendorProductRequest) =>
    api.post<Product>('/api/vendor/products', data).then(r => r.data),

  update: (id: number, data: VendorProductRequest) =>
    api.put<Product>(`/api/vendor/products/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/api/vendor/products/${id}`),

  updateStatus: (id: number, status: string) =>
    api.patch<Product>(`/api/vendor/products/${id}/status`, null, {
      params: { status }
    }).then(r => r.data),

  // Variants
  getVariants: (id: number) =>
    api.get<ProductVariantResponse[]>(`/api/vendor/products/${id}/variants`)
      .then(r => r.data),

  addVariant: (id: number, data: CreateVariantRequest) =>
    api.post<ProductVariantResponse>(
      `/api/vendor/products/${id}/variants`, data).then(r => r.data),

  updateVariant: (id: number, variantId: number, data: CreateVariantRequest) =>
    api.put<ProductVariantResponse>(
      `/api/vendor/products/${id}/variants/${variantId}`, data).then(r => r.data),

  deleteVariant: (id: number, variantId: number) =>
    api.delete(`/api/vendor/products/${id}/variants/${variantId}`),

  updateVariantStock: (id: number, variantId: number, stock: number) =>
    api.patch<ProductVariantResponse>(
      `/api/vendor/products/${id}/variants/${variantId}/stock`, null, {
        params: { stock }
      }).then(r => r.data),

  // Images
  uploadImage: (id: number, file: File, primary = false) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<ProductImage>(
      `/api/vendor/products/${id}/images?primary=${primary}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(r => r.data);
  },

  deleteImage: (id: number, imageId: number) =>
    api.delete(`/api/vendor/products/${id}/images/${imageId}`),

  setPrimaryImage: (id: number, imageId: number) =>
    api.patch(`/api/vendor/products/${id}/images/${imageId}/primary`),

  // Stats
  getStats: (id: number) =>
    api.get<Record<string, any>>(`/api/vendor/products/${id}/stats`)
      .then(r => r.data),
};