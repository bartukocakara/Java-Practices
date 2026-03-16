import api from './axios';
import { Cart } from '@/types';

export const cartApi = {
  get: () =>
    api.get<Cart>('/api/cart').then(r => r.data),

  addItem: (productId: number, quantity: number, variantId?: number) =>
    api.post<Cart>('/api/cart/items', {
      productId,
      quantity,
      ...(variantId ? { variantId } : {}),
    }).then(r => r.data),

  updateItem: (cartItemId: number, quantity: number) =>
    api.patch<Cart>(`/api/cart/items/${cartItemId}`, null, {
      params: { quantity },
    }).then(r => r.data),

  removeItem: (cartItemId: number) =>
    api.delete<Cart>(`/api/cart/items/${cartItemId}`).then(r => r.data),

  clear: () => api.delete('/api/cart'),
};