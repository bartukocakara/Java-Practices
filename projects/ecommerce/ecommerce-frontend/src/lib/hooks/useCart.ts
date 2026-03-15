import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/lib/api/cart';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export const CART_KEYS = {
  cart: ['cart'] as const,
};

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  const { setCart, clearCart } = useCartStore();

  const query = useQuery({
    queryKey: CART_KEYS.cart,
    queryFn: cartApi.get,
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (query.data) setCart(query.data);
  }, [query.data, setCart]);

  useEffect(() => {
    if (!isAuthenticated) clearCart();
  }, [isAuthenticated, clearCart]);

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
      queryClient.setQueryData(CART_KEYS.cart, cart);
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
      queryClient.setQueryData(CART_KEYS.cart, cart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const { setCart } = useCartStore();
  return useMutation({
    mutationFn: (cartItemId: number) => cartApi.removeItem(cartItemId),
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(CART_KEYS.cart, cart);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();
  return useMutation({
    mutationFn: cartApi.clear,
    onSuccess: () => {
      clearCart();
      queryClient.setQueryData(CART_KEYS.cart, null);
    },
  });
}