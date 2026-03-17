import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, FilterParams } from '@/lib/api/products';
import { useAuthStore } from '@/store/authStore';

export const PRODUCT_KEYS = {
  all:     ['products'] as const,
  lists:   () => ['products', 'list'] as const,
  list:    (page: number, size: number, sortBy?: string, direction?: string) =>
             ['products', 'list', page, size, sortBy, direction] as const,
  filters: () => ['products', 'filter'] as const,
  filter:  (params: object) => ['products', 'filter', params] as const,
  details: () => ['products', 'detail'] as const,
  detail:  (slug: string) => ['products', 'detail', slug] as const,
  reviews: (id: number) => ['products', id, 'reviews'] as const,
};

export function useProducts(
  page = 0,
  size = 12,
  sortBy = 'name',
  direction = 'asc'
) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(page, size, sortBy, direction),
    queryFn:  () => productApi.getAll(page, size, sortBy, direction),
    placeholderData: (prev) => prev,
  });
}

export function useFilteredProducts(params: FilterParams) {
  return useQuery({
    queryKey: PRODUCT_KEYS.filter(params),
    queryFn:  () => productApi.filter(params),
    placeholderData: (prev) => prev,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn:  () => productApi.getBySlug(slug),
    enabled:  !!slug,
    retry:    false,
  });
}

export function useProductReviews(productId: number) {
  return useQuery({
    queryKey: PRODUCT_KEYS.reviews(productId),
    queryFn:  () => productApi.getReviews(productId),
    enabled:  productId > 0,
  });
}

export function useSubmitReview(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { rating: number; comment: string }) =>
      productApi.submitReview(productId, data),
    onSuccess: () => {
      // Refresh reviews list for this product
      queryClient.invalidateQueries({
        queryKey: PRODUCT_KEYS.reviews(productId),
      });
      // Refresh all product details (reviewCount update)
      queryClient.invalidateQueries({
        queryKey: PRODUCT_KEYS.details(),  // ← now exists
      });
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: {
      id: number;
      data: Parameters<typeof productApi.update>[1];
    }) => productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
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

export function useCanReview(productId: number) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['can-review', productId],
    queryFn:  () => productApi.canReview(productId),
    enabled:  isAuthenticated && productId > 0,
  });
}