import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, CreateOrderRequest } from '@/lib/api/orders';
import { useAuthStore } from '@/store/authStore';

export const ORDER_KEYS = {
  all:  ['orders'] as const,
  mine: () => ['orders', 'mine'] as const,
  detail: (id: number) => ['orders', id] as const,
};

export function useMyOrders() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ORDER_KEYS.mine(),
    queryFn:  orderApi.getMyOrders,
    enabled:  isAuthenticated,
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ORDER_KEYS.detail(id),
    queryFn:  () => orderApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => orderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.mine() });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}