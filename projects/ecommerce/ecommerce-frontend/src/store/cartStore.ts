import { create } from 'zustand';
import { Cart } from '@/types';

interface CartState {
  cart: Cart | null;
  itemCount: number;
  setCart: (cart: Cart) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  itemCount: 0,

  setCart: (cart) =>
    set({
      cart,
      itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    }),

  clearCart: () => set({ cart: null, itemCount: 0 }),
}));