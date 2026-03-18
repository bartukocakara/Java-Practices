import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorOrderApi } from '@/lib/api/vendorOrders';

const KEYS = {
  all:    (status?: string) => ['vendor-orders', status]    as const,
  detail: (id: number)      => ['vendor-orders', 'detail', id] as const,
  stats:  ()                => ['vendor-orders', 'stats']   as const,
};

export function useVendorOrders(status?: string) {
  return useQuery({
    queryKey: KEYS.all(status),
    queryFn:  () => vendorOrderApi.getAll(status),
  });
}

export function useVendorOrder(id: number) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => vendorOrderApi.getById(id),
    enabled:  id > 0,
  });
}

export function useVendorOrderStats() {
  return useQuery({
    queryKey: KEYS.stats(),
    queryFn:  vendorOrderApi.getStats,
  });
}

export function useUpdateVendorOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      vendorOrderApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-orders'] });
    },
  });
}