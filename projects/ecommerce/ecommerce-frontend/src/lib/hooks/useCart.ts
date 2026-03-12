import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/lib/api/cart';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (query.data) setCart(query.data);
  }, [query.data, setCart]);

  return query;
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { setCart } = useCartStore();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      cartApi.addItem(productId, quantity),
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(['cart'], cart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const { setCart } = useCartStore();
  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) =>
      cartApi.updateItem(cartItemId, quantity),
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(['cart'], cart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const { setCart } = useCartStore();
  return useMutation({
    mutationFn: cartApi.removeItem,
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(['cart'], cart);
    },
  });
}