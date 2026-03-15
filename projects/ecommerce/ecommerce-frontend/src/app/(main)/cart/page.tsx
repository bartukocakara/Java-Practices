'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Trash2, Plus, Minus,
  ArrowRight, Package, ShoppingBag, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/lib/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { CartItem } from '@/types';
import { toast } from 'sonner';

function CartItemRow({ item }: { item: CartItem }) {
  const { mutate: updateItem, isPending: updating } = useUpdateCartItem();
  const { mutate: removeItem, isPending: removing } = useRemoveCartItem();
  const [localQty, setLocalQty] = useState(item.quantity);

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;
    setLocalQty(newQty);
    updateItem(
      { cartItemId: item.cartItemId, quantity: newQty },
      {
        onError: () => {
          setLocalQty(item.quantity);
          toast.error('Failed to update quantity');
        },
      }
    );
  };

  const handleRemove = () => {
    removeItem(item.cartItemId, {
      onSuccess: () => toast.success(`${item.productName} removed from cart`),
      onError:   () => toast.error('Failed to remove item'),
    });
  };

  const isLoading = updating || removing;

  return (
    <div className={`flex gap-4 py-5 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>

      {/* Product Image */}
      <Link href={`/products/${item.productId}`} className="shrink-0">
        <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted border">
          <div className="flex h-full items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground/30" />
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.productId}`}
            className="font-medium text-sm leading-tight hover:text-primary transition-colors line-clamp-2"
          >
            {item.productName}
          </Link>
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 mt-auto">
          {/* Quantity Controls */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => handleQuantityChange(localQty - 1)}
              disabled={localQty <= 1 || isLoading}
              className="px-2.5 py-1.5 hover:bg-muted transition-colors disabled:opacity-40"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-3 py-1.5 text-sm font-medium min-w-[2.5rem] text-center border-x">
              {localQty}
            </span>
            <button
              onClick={() => handleQuantityChange(localQty + 1)}
              disabled={isLoading}
              className="px-2.5 py-1.5 hover:bg-muted transition-colors disabled:opacity-40"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-semibold text-primary">
              ${item.subtotal.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              ${item.unitPrice.toFixed(2)} each
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-5">
          <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <div className="flex justify-between items-center mt-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CartPage() {
  const router                    = useRouter();
  const { isAuthenticated }       = useAuthStore();
  const { data: cart, isLoading } = useCart();
  const { mutate: clearCart, isPending: clearing } = useClearCart();

  const handleClearCart = () => {
    clearCart(undefined, {
      onSuccess: () => toast.success('Cart cleared'),
      onError:   () => toast.error('Failed to clear cart'),
    });
  };

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Sign in to view your cart</h2>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to access your shopping cart.
        </p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartSkeleton />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const items      = cart?.items ?? [];
  const totalAmount = cart?.totalAmount ?? 0;
  const itemCount  = items.reduce((sum, i) => sum + i.quantity, 0);

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added anything yet.
        </p>
        <Button asChild>
          <Link href="/products">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  const shipping     = totalAmount >= 50 ? 0 : 9.99;
  const tax          = totalAmount * 0.08;
  const orderTotal   = totalAmount + shipping + tax;
  const freeShippingRemaining = Math.max(0, 50 - totalAmount);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              disabled={clearing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear cart
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all {itemCount} item{itemCount !== 1 ? 's' : ''} from your cart.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearCart}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear Cart
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Cart Items ── */}
        <div className="lg:col-span-2">

          {/* Free shipping progress */}
          {freeShippingRemaining > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">
                  Add{' '}
                  <span className="text-primary">${freeShippingRemaining.toFixed(2)}</span>
                  {' '}more for free shipping!
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalAmount / 50) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {shipping === 0 && (
            <div className="mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                ✓ Free Shipping
              </Badge>
              <p className="text-sm text-green-600 font-medium">
                You qualify for free shipping!
              </p>
            </div>
          )}

          {/* Items */}
          <div className="rounded-xl border bg-card divide-y">
            {items.map(item => (
              <div key={item.cartItemId} className="px-4">
                <CartItemRow item={item} />
              </div>
            ))}
          </div>

          {/* Continue shopping */}
          <div className="mt-4">
            <Button variant="ghost" asChild className="text-muted-foreground">
              <Link href="/products">
                ← Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-card p-6 space-y-4 sticky top-24">
            <h2 className="font-semibold text-lg">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})
                </span>
                <span className="font-medium">${totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-primary text-lg">${orderTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="space-y-2 pt-2">
              <p className="text-xs text-muted-foreground text-center">
                Secure checkout · SSL encrypted
              </p>
              <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                <span>🔒 Secure</span>
                <span>•</span>
                <span>📦 Fast Delivery</span>
                <span>•</span>
                <span>↩ Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}