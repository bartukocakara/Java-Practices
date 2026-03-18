import api from './axios';
import { Order } from '@/types';

export interface VendorOrderStats {
  total:        number;
  pending:      number;
  confirmed:    number;
  shipped:      number;
  delivered:    number;
  cancelled:    number;
  totalRevenue: number;
  monthRevenue: number;
}

export const vendorOrderApi = {
  getAll: (status?: string) =>
    api.get<Order[]>('/api/vendor/orders', {
      params: { status },
    }).then(r => r.data),

  getById: (id: number) =>
    api.get<Order>(`/api/vendor/orders/${id}`).then(r => r.data),

  updateStatus: (id: number, status: string) =>
    api.patch<Order>(`/api/vendor/orders/${id}/status`, null, {
      params: { status },
    }).then(r => r.data),

  getStats: () =>
    api.get<VendorOrderStats>('/api/vendor/orders/stats').then(r => r.data),
};