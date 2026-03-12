import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/lib/api/products';

export const PRODUCT_KEYS = {
  all: ['products'] as const,
  list: (page: number, size: number) => ['products', 'list', page, size] as const,
  filter: (params: object) => ['products', 'filter', params] as const,
  detail: (id: number) => ['products', id] as const,
  reviews: (id: number) => ['products', id, 'reviews'] as const,
};

export function useProducts(page = 0, size = 12) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(page, size),
    queryFn: () => productApi.getAll(page, size),
  });
}

export function useFilteredProducts(params: Parameters<typeof productApi.filter>[0]) {
  return useQuery({
    queryKey: PRODUCT_KEYS.filter(params),
    queryFn: () => productApi.filter(params),
    placeholderData: (prev) => prev,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
}

export function useProductReviews(productId: number) {
  return useQuery({
    queryKey: PRODUCT_KEYS.reviews(productId),
    queryFn: () => productApi.getReviews(productId),
    enabled: !!productId,
  });
}

export function useSubmitReview(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { rating: number; comment: string }) =>
      productApi.submitReview(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.reviews(productId) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
}