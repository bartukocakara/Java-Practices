import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi, VendorApplicationRequest } from '@/lib/api/vendor';
import { useAuthStore } from '@/store/authStore';

export const VENDOR_KEYS = {
  application:  ['vendor', 'application']  as const,
  dashboard:    ['vendor', 'dashboard']    as const,
  store:        ['vendor', 'store']        as const,
  allApps:      ['admin', 'applications']  as const,
  allVendors:   ['admin', 'vendors']       as const,
};

export function useVendorApplication() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: VENDOR_KEYS.application,
    queryFn:  vendorApi.getApplication,
    enabled:  isAuthenticated,
    retry:    false,
  });
}

export function useVendorDashboard() {
  return useQuery({
    queryKey: VENDOR_KEYS.dashboard,
    queryFn:  vendorApi.getDashboard,
  });
}

export function useApplyAsVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VendorApplicationRequest) => vendorApi.apply(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_KEYS.application });
    },
  });
}

export function useAllApplications() {
  return useQuery({
    queryKey: VENDOR_KEYS.allApps,
    queryFn:  vendorApi.getAllApplications,
  });
}

export function useReviewApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, adminNote }: {
      id: number; decision: string; adminNote?: string
    }) => vendorApi.reviewApplication(id, decision, adminNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_KEYS.allApps });
    },
  });
}

export function useAllVendors() {
  return useQuery({
    queryKey: VENDOR_KEYS.allVendors,
    queryFn:  vendorApi.getAllVendors,
  });
}

export function useUpdateVendorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      vendorApi.updateVendorStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_KEYS.allVendors });
    },
  });
}