import api from './axios';
import { Order } from '@/types';

export interface CreateOrderRequest {
  fullName:      string;
  phone:         string;
  addressLine:   string;
  city:          string;
  country:       string;
  paymentMethod: string;
  notes?:        string;
  items: { productId: number; quantity: number }[];
}

export const orderApi = {
  create: (data: CreateOrderRequest) =>
    api.post<Order>('/api/orders', data).then(r => r.data),

  getMyOrders: () =>
    api.get<Order[]>('/api/orders').then(r => r.data),

  getById: (id: number) =>
    api.get<Order>(`/api/orders/${id}`).then(r => r.data),

  getAll: () =>
    api.get<Order[]>('/api/orders/all').then(r => r.data),

  updateStatus: (id: number, status: string) =>
    api.patch<Order>(`/api/orders/${id}/status`, null, {
      params: { status },
    }).then(r => r.data),
};