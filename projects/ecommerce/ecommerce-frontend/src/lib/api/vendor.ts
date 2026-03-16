import api from './axios';
import { VendorApplication, Vendor, VendorDashboard } from '@/types';

export interface VendorApplicationRequest {
  storeName:   string;
  description: string;
  email:       string;
  phone?:      string;
  address?:    string;
}

export const vendorApi = {
  // Vendor
  apply:          (data: VendorApplicationRequest) =>
    api.post<VendorApplication>('/api/vendor/apply', data).then(r => r.data),

  getApplication: () =>
    api.get<VendorApplication>('/api/vendor/application').then(r => r.data),

  getDashboard:   () =>
    api.get<VendorDashboard>('/api/vendor/dashboard').then(r => r.data),

  getMyStore:     () =>
    api.get<Vendor>('/api/vendor/store').then(r => r.data),

  // Admin
  getAllApplications:     () =>
    api.get<VendorApplication[]>('/api/admin/applications').then(r => r.data),

  getPendingApplications: () =>
    api.get<VendorApplication[]>('/api/admin/applications/pending').then(r => r.data),

  reviewApplication: (id: number, decision: string, adminNote?: string) =>
    api.patch<VendorApplication>(`/api/admin/applications/${id}/review`, {
      decision, adminNote
    }).then(r => r.data),

  getAllVendors:  () =>
    api.get<Vendor[]>('/api/admin/vendors').then(r => r.data),

  updateVendorStatus: (id: number, status: string) =>
    api.patch<Vendor>(`/api/admin/vendors/${id}/status`, null, {
      params: { status }
    }).then(r => r.data),
};