import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  vendorProductApi,
  VendorProductRequest,
  CreateVariantRequest,
} from '@/lib/api/vendorProducts';

const KEYS = {
  all:     (filters?: any) => ['vendor-products', filters] as const,
  detail:  (id: number)    => ['vendor-products', id]      as const,
  variants:(id: number)    => ['vendor-products', id, 'variants'] as const,
  stats:   (id: number)    => ['vendor-products', id, 'stats']    as const,
};

export function useVendorProducts(status?: string, lowStock?: boolean) {
  return useQuery({
    queryKey: KEYS.all({ status, lowStock }),
    queryFn:  () => vendorProductApi.getAll(status, lowStock),
  });
}

export function useVendorProduct(id: number) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => vendorProductApi.getById(id),
    enabled:  id > 0,
  });
}

export function useVendorProductStats(id: number) {
  return useQuery({
    queryKey: KEYS.stats(id),
    queryFn:  () => vendorProductApi.getStats(id),
    enabled:  id > 0,
  });
}

export function useCreateVendorProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VendorProductRequest) => vendorProductApi.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['vendor-products'] }),
  });
}

export function useUpdateVendorProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VendorProductRequest }) =>
      vendorProductApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-products'] }),
  });
}

export function useDeleteVendorProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vendorProductApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['vendor-products'] }),
  });
}

export function useUpdateVendorProductStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      vendorProductApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-products'] }),
  });
}

export function useAddVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateVariantRequest }) =>
      vendorProductApi.addVariant(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: KEYS.variants(id) });
    },
  });
}

export function useUpdateVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, variantId, data }: {
      id: number; variantId: number; data: CreateVariantRequest
    }) => vendorProductApi.updateVariant(id, variantId, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: KEYS.detail(id) }),
  });
}

export function useDeleteVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, variantId }: { id: number; variantId: number }) =>
      vendorProductApi.deleteVariant(id, variantId),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: KEYS.detail(id) }),
  });
}

export function useUpdateVariantStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, variantId, stock }: {
      id: number; variantId: number; stock: number
    }) => vendorProductApi.updateVariantStock(id, variantId, stock),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: KEYS.detail(id) }),
  });
}

export function useUploadProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file, primary }: {
      id: number; file: File; primary?: boolean
    }) => vendorProductApi.uploadImage(id, file, primary),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: KEYS.detail(id) }),
  });
}

export function useDeleteProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageId }: { id: number; imageId: number }) =>
      vendorProductApi.deleteImage(id, imageId),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: KEYS.detail(id) }),
  });
}

export function useSetPrimaryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageId }: { id: number; imageId: number }) =>
      vendorProductApi.setPrimaryImage(id, imageId),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: KEYS.detail(id) }),
  });
}