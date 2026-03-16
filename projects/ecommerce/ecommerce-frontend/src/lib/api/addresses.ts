import api from './axios';
import { Address, AddressRequest } from '@/types';

export const addressApi = {
  getAll: () =>
    api.get<Address[]>('/api/addresses').then(r => r.data),

  getById: (id: number) =>
    api.get<Address>(`/api/addresses/${id}`).then(r => r.data),

  create: (data: AddressRequest) =>
    api.post<Address>('/api/addresses', data).then(r => r.data),

  update: (id: number, data: AddressRequest) =>
    api.put<Address>(`/api/addresses/${id}`, data).then(r => r.data),

  setDefault: (id: number) =>
    api.patch<Address>(`/api/addresses/${id}/default`).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/api/addresses/${id}`),
};