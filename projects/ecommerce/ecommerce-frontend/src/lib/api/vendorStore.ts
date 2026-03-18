import api from './axios';
import { Vendor } from '@/types';

export interface UpdateStoreRequest {
  storeName:   string;
  description: string;
  email:       string;
  phone?:      string;
  address?:    string;
}

export const vendorStoreApi = {
  getMyStore: () =>
    api.get<Vendor>('/api/vendor/store').then(r => r.data),

  update: (data: UpdateStoreRequest) =>
    api.put<Vendor>('/api/vendor/store', data).then(r => r.data),

  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<Vendor>('/api/vendor/store/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  uploadBanner: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<Vendor>('/api/vendor/store/banner', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/api/auth/change-password', {
      currentPassword, newPassword,
    }),
};