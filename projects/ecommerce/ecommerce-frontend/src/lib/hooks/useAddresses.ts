import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressApi } from '@/lib/api/addresses';
import { AddressRequest } from '@/types';

export const ADDRESS_KEYS = {
  all:    ['addresses'] as const,
  detail: (id: number) => ['addresses', id] as const,
};

export function useAddresses() {
  return useQuery({
    queryKey: ADDRESS_KEYS.all,
    queryFn:  addressApi.getAll,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddressRequest) => addressApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.all }),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddressRequest }) =>
      addressApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.all }),
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => addressApi.setDefault(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.all }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => addressApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.all }),
  });
}