import api from './axios';
import { Order } from '@/types';

export const orderApi = {
  getMyOrders: () =>
    api.get<Order[]>('/api/orders').then(r => r.data),

  getById: (id: number) =>
    api.get<Order>(`/api/orders/${id}`).then(r => r.data),

  create: (items: { productId: number; quantity: number }[]) =>
    api.post<Order>('/api/orders', { items }).then(r => r.data),

  // Admin
  getAll: () =>
    api.get<Order[]>('/api/orders/all').then(r => r.data),

  updateStatus: (id: number, status: string) =>
    api.patch<Order>(`/api/orders/${id}/status`, null, {
      params: { status },
    }).then(r => r.data),
};