'use client';

import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/types';
import { useAddToCart } from '@/lib/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { isAuthenticated } = useAuthStore();
  const { mutate: addToCart, isPending } = useAddToCart();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    addToCart(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => toast.success(`${product.name} added to cart`),
        onError: () => toast.error('Failed to add to cart'),
      }
    );
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">

        {/* Image placeholder */}
        <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Only {product.stock} left
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-2">
          {product.categoryName && (
            <Badge variant="outline" className="text-xs">
              {product.categoryName}
            </Badge>
          )}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          {product.averageRating != null && product.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{product.averageRating.toFixed(1)}</span>
              {product.reviewCount != null && (
                <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isPending || product.stock === 0}
            className="shrink-0"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isPending ? 'Adding...' : 'Add'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}