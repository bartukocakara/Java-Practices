'use client';

import { useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart, Star, StarHalf, Package,
  Truck, Shield, RefreshCw, Plus, Minus, Heart,
  ChevronRight, AlertTriangle,
  Store,
} from 'lucide-react';
import { Button }    from '@/components/ui/button';
import { Badge }     from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton }  from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea }  from '@/components/ui/textarea';
import { Label }     from '@/components/ui/label';
import {
  useCanReview, useProduct, useProductReviews, useSubmitReview,
} from '@/lib/hooks/useProducts';
import { useAddToCart } from '@/lib/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { VariantSelector } from '@/components/product/VariantSelector';
import { toast } from 'sonner';
import { ProductVariantResponse, Review } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9090';

// ── Star display ──
function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => {
        const full = rating >= s;
        const half = !full && rating >= s - 0.5;
        return (
          <span key={s}>
            {full
              ? <Star     className={`${cls} fill-yellow-400 text-yellow-400`} />
              : half
                ? <StarHalf className={`${cls} fill-yellow-400 text-yellow-400`} />
                : <Star     className={`${cls} text-muted-foreground/25`} />
            }
          </span>
        );
      })}
    </div>
  );
}

// ── Review row ──
function ReviewRow({ review }: { review: Review }) {
  return (
    <div className="py-5 border-b last:border-0 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
              {review.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">{review.username}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <StarDisplay rating={review.rating} />
      </div>
      {review.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed pl-11">
          {review.comment}
        </p>
      )}
    </div>
  );
}

// ── Skeleton ──
function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-5 w-56 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

// ── Stock badge ──
function StockBadge({ stock, isOutOfStock }: { stock: number; isOutOfStock: boolean }) {
  if (isOutOfStock) return (
    <Badge variant="destructive" className="flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" /> Out of Stock
    </Badge>
  );
  if (stock <= 5) return (
    <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-500">
      Only {stock} left
    </Badge>
  );
  return (
    <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900/30">
      In Stock ({stock})
    </Badge>
  );
}

// ── Main content — ALL hooks at top level, no conditionals ──
function ProductDetailContent({ slug }: { slug: string }) {
  const router              = useRouter();
  const { isAuthenticated } = useAuthStore();

  // ── All state ──
  const [quantity, setQuantity]                 = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant]   = useState<ProductVariantResponse | null>(null);
  const [rating, setRating]                     = useState(0);
  const [hoverRating, setHoverRating]           = useState(0);
  const [comment, setComment]                   = useState('');

  // ── All hooks — no early returns before these ──
  const { data: product, isLoading, error }              = useProduct(slug);
  const { data: reviews = [] }                           = useProductReviews(product?.id ?? 0);
  const { data: reviewEligibility }                      = useCanReview(product?.id ?? 0);
  const { mutate: addToCart, isPending: addingToCart }   = useAddToCart();
  const { mutate: submitReview, isPending: submittingReview } =
    useSubmitReview(product?.id ?? 0);

  const handleVariantSelect = useCallback((v: ProductVariantResponse | null) => {
    setSelectedVariant(v);
    setQuantity(1);
  }, []);

  // ── Derived values ──
  const effectiveStock: number = (() => {
    if (product?.hasVariants) {
      if (selectedVariant) return selectedVariant.stock;
      // Sum all variant stocks
      return (product.variants ?? []).reduce((sum, v) => sum + v.stock, 0);
    }
    return product?.stock ?? 0;
  })();

  const isOutOfStock: boolean = (() => {
    if (product?.hasVariants) {
      if (selectedVariant) return selectedVariant.stock === 0;
      return (product.variants ?? []).every(v => v.stock === 0);
    }
    return (product?.stock ?? 0) === 0;
  })();

  const isLowStock   = !isOutOfStock && effectiveStock > 0 && effectiveStock <= 5;
  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const hasVariants  = (product?.variants?.length ?? 0) > 0 && !!product?.hasVariants;
  const needsVariant = hasVariants && !selectedVariant;
  const canAddToCart = !needsVariant && !isOutOfStock && effectiveStock > 0;

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  const images        = product?.images ?? [];
  const displayUrls   = images.map(img => `${API_BASE}${img.imageUrl}`);
  const variantImgUrl = selectedVariant?.imageUrl
    ? `${API_BASE}${selectedVariant.imageUrl}` : null;
  const allUrls       = variantImgUrl
    ? [variantImgUrl, ...displayUrls] : displayUrls;

  // ── Handlers ──
  const handleAddToCart = () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!product) return;
    if (needsVariant)  { toast.error('Please select options before adding to cart'); return; }
    if (isOutOfStock)  { toast.error('This item is out of stock'); return; }
    if (effectiveStock <= 0) { toast.error('This item is out of stock'); return; }

    addToCart(
      { productId: product.id, quantity, variantId: selectedVariant?.id },
      {
        onSuccess: () => toast.success(`${quantity}× ${product.name} added to cart`),
        onError:   (err: any) =>
          toast.error(err?.response?.data?.message ?? 'Failed to add to cart'),
      }
    );
  };

  const handleSubmitReview = () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    submitReview(
      { rating, comment },
      {
        onSuccess: () => { toast.success('Review submitted!'); setRating(0); setComment(''); },
        onError:   (err: any) =>
          toast.error(err?.response?.data?.message ?? 'Failed to submit review'),
      }
    );
  };

  // ── Conditional renders AFTER all hooks ──
  if (isLoading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center gap-4">
        <Package className="h-16 w-16 text-muted-foreground/20" />
        <h2 className="text-xl font-semibold">Product not found</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild><Link href="/products">Browse Products</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8 flex-wrap">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
        {product.categoryName && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="text-muted-foreground">{product.categoryName}</span>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground font-medium line-clamp-1 max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

        {/* ── Images ── */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border">
            {allUrls[selectedImageIdx] ? (
              <Image
                src={allUrls[selectedImageIdx]}
                alt={product.name}
                fill priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={process.env.NODE_ENV === 'development'}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-20 w-20 text-muted-foreground/20" />
              </div>
            )}
            {isOutOfStock && !needsVariant && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                <AlertTriangle className="h-10 w-10 text-destructive/70" />
                <Badge variant="destructive" className="text-sm px-4 py-1.5">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>
          {allUrls.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {allUrls.map((url, idx) => (
                <button key={idx} onClick={() => setSelectedImageIdx(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIdx === idx
                      ? 'border-primary shadow-sm'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}>
                  <Image src={url} alt={`${product.name} ${idx + 1}`} fill
                    className="object-cover" sizes="80px"
                    unoptimized={process.env.NODE_ENV === 'development'} />
                </button>
              ))}
            </div>
          )}
        </div>
        {/* ── Product Info ── */}
        <div className="space-y-5 lg:py-2">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.categoryName && (
              <Badge variant="outline" className="font-normal">
                {product.categoryName}
              </Badge>
            )}
            {(!hasVariants || selectedVariant) && (
              <StockBadge stock={effectiveStock} isOutOfStock={isOutOfStock} />
            )}
            {/* Vendor badge — links to public store page */}
            {product.vendorSlug && (
              <Link href={`/vendors/${product.vendorSlug}`}>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5 cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  <Store className="h-3 w-3" />
                  {product.vendorName ?? 'View Store'}
                </Badge>
              </Link>
            )}
          </div>

          {/* Name */}
          <h1 className="text-3xl font-bold tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <StarDisplay rating={avgRating} size="lg" />
              <span className="font-semibold text-sm">{avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">
                ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">
              ${displayPrice.toFixed(2)}
            </span>
            {hasVariants && !selectedVariant && product.maxPrice &&
             product.maxPrice !== product.price && (
              <span className="text-xl text-muted-foreground">
                – ${product.maxPrice.toFixed(2)}
              </span>
            )}
          </div>

          <Separator />

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed text-sm">
            {product.description}
          </p>

          {/* Variant selector */}
          {hasVariants && (
            <>
              <Separator />
              <VariantSelector
                variants={product.variants!}
                onVariantSelect={handleVariantSelect}
              />
            </>
          )}

          <Separator />

          {/* Add to cart section */}
          {needsVariant ? (
            // Has variants but none selected
            <div className="p-4 rounded-xl bg-muted/50 border border-dashed text-center">
              <p className="text-sm text-muted-foreground">
                Select options above to add to cart
              </p>
            </div>

          ) : isOutOfStock ? (
            // Out of stock — no button at all
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-destructive">
                    Currently Out of Stock
                  </p>
                  <p className="text-xs text-destructive/80 mt-0.5">
                    Check back later or browse similar products
                  </p>
                </div>
              </div>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/products">Browse Similar Products</Link>
              </Button>
            </div>

          ) : (
            // In stock — show quantity + add to cart
            <div className="space-y-4">
              {isLowStock && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Only {effectiveStock} left — order soon!
                </div>
              )}

              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium shrink-0">Quantity</Label>
                <div className="flex items-center rounded-lg border overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 hover:bg-muted transition-colors disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium border-x min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(effectiveStock, q + 1))}
                    disabled={quantity >= effectiveStock}
                    className="px-3 py-2 hover:bg-muted transition-colors disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">{effectiveStock} available</span>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={handleAddToCart}
                  disabled={addingToCart || !canAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button size="lg" variant="outline" className="px-4">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Trust icons */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { Icon: Truck,     title: 'Free Shipping', sub: 'On orders $50+' },
              { Icon: Shield,    title: 'Secure Pay',    sub: '100% protected'  },
              { Icon: RefreshCw, title: 'Easy Returns',  sub: '30-day policy'   },
            ].map(({ Icon, title, sub }) => (
              <div key={title} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 text-center">
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">{title}</span>
                <span className="text-xs text-muted-foreground">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="reviews" className="mb-12">
        <TabsList>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          {hasVariants && (
            <TabsTrigger value="variants">
              All Variants ({product.variants!.length})
            </TabsTrigger>
          )}
        </TabsList>

        {/* Reviews tab */}
        <TabsContent value="reviews" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Rating breakdown */}
            {reviews.length > 0 && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-card p-6 text-center">
                  <div className="text-6xl font-bold text-primary mb-1">
                    {avgRating.toFixed(1)}
                  </div>
                  <StarDisplay rating={avgRating} size="lg" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="space-y-2.5">
                  {ratingBreakdown.map(({ star, count, pct }) => (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-3 text-right text-muted-foreground shrink-0">{star}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-4 text-right text-muted-foreground shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review form + list */}
            <div className={reviews.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>

              {/* Review form — eligibility gated */}
              {!isAuthenticated ? (
                <div className="rounded-lg border bg-muted/40 p-4 mb-6 text-sm text-center text-muted-foreground">
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>{' '}to leave a review
                </div>
              ) : reviewEligibility?.reason === 'ALREADY_REVIEWED' ? (
                <div className="rounded-xl border bg-muted/40 p-5 mb-6 text-center space-y-1">
                  <p className="text-sm font-medium">✅ You've already reviewed this product</p>
                  <p className="text-xs text-muted-foreground">Thank you for your feedback!</p>
                </div>
              ) : reviewEligibility?.reason === 'NOT_PURCHASED' ? (
                <div className="rounded-xl border bg-muted/40 p-5 mb-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                      <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Purchase required to review</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Only customers who have received this product can leave a review
                      </p>
                    </div>
                  </div>
                </div>
              ) : reviewEligibility?.canReview ? (
                <div className="rounded-xl border bg-card p-5 mb-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">Write a Review</h3>
                    <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} type="button"
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 transition-transform hover:scale-110">
                        <Star className={`h-7 w-7 transition-colors ${
                          (hoverRating || rating) >= s
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/25'
                        }`} />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                      </span>
                    )}
                  </div>
                  <Textarea placeholder="Share your experience with this product..."
                    value={comment} onChange={e => setComment(e.target.value)}
                    rows={3} maxLength={1000} className="resize-none" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{comment.length} / 1000</span>
                    <Button size="sm" onClick={handleSubmitReview}
                      disabled={submittingReview || rating === 0}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* Review list */}
              {reviews.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-10" />
                  <p className="font-medium">No reviews yet</p>
                  <p className="text-sm mt-1">Be the first to review this product</p>
                </div>
              ) : (
                <div>{reviews.map(r => <ReviewRow key={r.id} review={r} />)}</div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Details tab */}
        <TabsContent value="details" className="mt-6">
          <div className="max-w-xl rounded-xl border bg-card overflow-hidden">
            {[
              { label: 'Product Name', value: product.name },
              { label: 'Category',     value: product.categoryName ?? '—' },
              { label: 'Base Price',   value: `$${product.price.toFixed(2)}` },
              { label: 'Availability', value: isOutOfStock ? 'Out of stock' : `${effectiveStock} units available` },
              { label: 'SKU',          value: selectedVariant?.sku ?? `PRD-${String(product.id).padStart(5, '0')}` },
              { label: 'Variants',     value: hasVariants ? `${product.variants!.length} options` : 'No variants' },
            ].map(({ label, value }, idx) => (
              <div key={label}
                className={`flex justify-between px-5 py-3 text-sm ${idx % 2 === 0 ? 'bg-muted/30' : ''}`}>
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-right max-w-[60%] break-all">{value}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Variants tab */}
        {hasVariants && (
          <TabsContent value="variants" className="mt-6">
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Variant</th>
                    <th className="text-left p-3 font-medium">SKU</th>
                    <th className="text-right p-3 font-medium">Price</th>
                    <th className="text-right p-3 font-medium">Stock</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {product.variants!.map(v => (
                    <tr key={v.id} onClick={() => handleVariantSelect(v)}
                      className={`cursor-pointer transition-colors hover:bg-muted/30 ${
                        selectedVariant?.id === v.id ? 'bg-primary/5' : ''
                      }`}>
                      <td className="p-3 font-medium">{v.displayLabel}</td>
                      <td className="p-3 text-muted-foreground font-mono text-xs">{v.sku}</td>
                      <td className="p-3 text-right font-semibold">${v.price.toFixed(2)}</td>
                      <td className={`p-3 text-right font-medium ${
                        v.stock === 0 ? 'text-destructive'
                          : v.stock <= 5 ? 'text-orange-500' : 'text-green-600'
                      }`}>{v.stock}</td>
                      <td className="p-3 text-center">
                        <Badge variant={v.stock > 0 && v.isActive ? 'default' : 'secondary'}
                          className="text-xs">
                          {!v.isActive ? 'Inactive' : v.stock === 0 ? 'Out of Stock' : 'Available'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <ProductDetailContent key={slug} slug={slug} />;
}