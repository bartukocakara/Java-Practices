import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorStoreApi, UpdateStoreRequest } from '@/lib/api/vendorStore';

const KEYS = {
  store: ['vendor-store'] as const,
};

export function useVendorStore() {
  return useQuery({
    queryKey: KEYS.store,
    queryFn:  vendorStoreApi.getMyStore,
  });
}

export function useUpdateVendorStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStoreRequest) => vendorStoreApi.update(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.store }),
  });
}

export function useUploadVendorLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => vendorStoreApi.uploadLogo(file),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.store }),
  });
}

export function useUploadVendorBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => vendorStoreApi.uploadBanner(file),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.store }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword:     string;
    }) => vendorStoreApi.changePassword(currentPassword, newPassword),
  });
}