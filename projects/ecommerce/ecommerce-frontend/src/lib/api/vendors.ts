import api from './axios';
import { Vendor, Product } from '@/types';

export const vendorsApi = {
  getBySlug: (slug: string) =>
    api.get<Vendor>(`/api/vendors/${slug}`).then(r => r.data),

  getProducts: (slug: string, page = 0, size = 12) =>
    api.get<Product[]>(`/api/vendors/${slug}/products`, {
      params: { page, size },
    }).then(r => r.data),
};