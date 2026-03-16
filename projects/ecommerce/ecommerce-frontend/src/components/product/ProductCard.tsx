'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Package, Zap } from 'lucide-react';
import { Button }  from '@/components/ui/button';
import { Product } from '@/types';
import { useAddToCart } from '@/lib/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9090';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { isAuthenticated }              = useAuthStore();
  const { mutate: addToCart, isPending } = useAddToCart();
  const router                           = useRouter();
  const [justAdded, setJustAdded]        = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Variant products — navigate to detail page via router
    // (Link click is prevented above so we push manually)
    if (product.hasVariants) {
      router.push(`/products/${product.slug}`);
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    addToCart(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => {
          toast.success(`${product.name} added to cart`);
          setJustAdded(true);
          setTimeout(() => setJustAdded(false), 1500);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message ?? 'Failed to add to cart');
        },
      }
    );
  };

  const imageUrl     = product.primaryImageUrl
    ? `${API_BASE}${product.primaryImageUrl}`
    : null;
  const isOutOfStock = product.stock === 0;
  const isLowStock   = product.stock > 0 && product.stock <= 5;

  const priceDisplay = () => {
    if (product.hasVariants && product.maxPrice && product.maxPrice !== product.price) {
      return (
        <div className="flex flex-col">
          <span className="text-base font-bold text-foreground leading-none">
            ${product.price.toFixed(2)}
            <span className="text-muted-foreground font-normal">
              {' '}– ${product.maxPrice.toFixed(2)}
            </span>
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Select options</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col">
        <span className="text-base font-bold text-foreground leading-none">
          ${product.price.toFixed(2)}
        </span>
        {!isOutOfStock && (
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {product.stock} in stock
          </span>
        )}
      </div>
    );
  };

  const buttonLabel = () => {
    if (isPending) return (
      <span className="flex items-center gap-1">
        <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
        Adding
      </span>
    );
    if (justAdded) return <span className="flex items-center gap-1">✓ Added</span>;
    if (product.hasVariants) return (
      <span className="flex items-center gap-1 text-xs">Select</span>
    );
    return (
      <span className="flex items-center gap-1">
        <ShoppingCart className="h-3 w-3" />
        Add
      </span>
    );
  };

  return (
    // ← Use div instead of Link as the outer wrapper
    // Navigation is handled by the image/name area Link below
    <div className="group block h-full cursor-pointer">
      <div className="relative flex flex-col h-full rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/30">

        {/* Clickable image + name area */}
        <Link href={`/products/${product.slug}`} className="flex flex-col flex-1">

          {/* Image */}
          <div className="relative h-52 shrink-0 bg-muted overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500"
                style={{ transform: 'scale(1)', transition: 'transform 500ms ease' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.07)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                unoptimized={process.env.NODE_ENV === 'development'}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <Package className="h-14 w-14 text-muted-foreground/20" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
              {product.categoryName && (
                <span className="inline-flex items-center rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium text-white tracking-wide uppercase">
                  {product.categoryName}
                </span>
              )}
              <div className="ml-auto flex flex-col gap-1 items-end">
                {isOutOfStock && (
                  <span className="rounded-full bg-background/90 backdrop-blur-sm border border-border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                    Out of Stock
                  </span>
                )}
                {isLowStock && (
                  <span className="rounded-full bg-destructive/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-white flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5" />
                    {product.stock} left
                  </span>
                )}
                {product.hasVariants && !isOutOfStock && !isLowStock && (
                  <span className="rounded-full bg-primary/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-white">
                    Multiple options
                  </span>
                )}
              </div>
            </div>

            {/* Rating pill */}
            {(product.averageRating ?? 0) > 0 && (
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-[11px] font-semibold text-white">
                  {(product.averageRating ?? 0).toFixed(1)}
                </span>
                {(product.reviewCount ?? 0) > 0 && (
                  <span className="text-[10px] text-white/70">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Text content */}
          <div className="flex flex-col p-4 gap-3 flex-1">
            <h3
              className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200"
              style={{ minHeight: '2.5rem' }}
            >
              {product.name}
            </h3>
            <p
              className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1"
              style={{ minHeight: '2.5rem' }}
            >
              {product.description}
            </p>
          </div>
        </Link>

        {/* Footer — outside Link so button click doesn't navigate */}
        <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-2 border-t border-border/50">
          {priceDisplay()}
          <Button
            size="sm"
            variant={justAdded ? 'secondary' : 'default'}
            onClick={handleAddToCart}
            disabled={isPending || isOutOfStock}
            className={`
              shrink-0 h-8 px-3 text-xs font-medium rounded-xl
              transition-all duration-200
              ${justAdded ? 'bg-green-500/10 text-green-600 border-green-500/30' : ''}
              ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
            `}
          >
            {buttonLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
}