'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Store, Star, ShoppingBag, Package,
  Mail, Phone, CheckCircle, ArrowLeft,
  MapPin, ChevronRight,
} from 'lucide-react';
import { Badge }     from '@/components/ui/badge';
import { Button }    from '@/components/ui/button';
import { Skeleton }  from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/product/ProductCard';
import { usePublicVendor, usePublicVendorProducts } from '@/lib/hooks/useVendors';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9090';

function VendorPageSkeleton() {
  return (
    <div>
      {/* Banner skeleton */}
      <Skeleton className="h-52 w-full" />
      <div className="container mx-auto px-4 mt-4 space-y-8">
        {/* Header */}
        <div className="flex items-end gap-5 -mt-12">
          <Skeleton className="h-24 w-24 rounded-2xl shrink-0" />
          <div className="space-y-2 pb-2 flex-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VendorStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const { data: vendor,   isLoading: vendorLoading }   = usePublicVendor(slug);
  const { data: products = [], isLoading: productsLoading } =
    usePublicVendorProducts(slug);

  if (vendorLoading) return <VendorPageSkeleton />;

  if (!vendor) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Store className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-semibold">Store not found</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          This store doesn't exist or may have been removed.
        </p>
        <Button variant="outline" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Products
          </Link>
        </Button>
      </div>
    );
  }

  const logoUrl   = vendor.logoUrl   ? `${API_BASE}${vendor.logoUrl}`   : null;
  const bannerUrl = vendor.bannerUrl ? `${API_BASE}${vendor.bannerUrl}` : null;
  const isActive  = vendor.status === 'ACTIVE';

  return (
    <div className="min-h-screen pb-16">

      {/* ── Banner ── */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={`${vendor.storeName} banner`}
            fill
            className="object-cover"
            unoptimized={process.env.NODE_ENV === 'development'}
          />
        ) : (
          /* Decorative pattern when no banner */
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}
                className="absolute rounded-full bg-primary"
                style={{
                  width:  `${80 + i * 40}px`,
                  height: `${80 + i * 40}px`,
                  top:    `${-20 + i * 10}px`,
                  left:   `${i * 140}px`,
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        )}
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Button variant="secondary" size="sm"
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
            asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Products
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4">

        {/* ── Store header ── */}
        <div className="relative -mt-14 flex items-end gap-5 mb-8">

          {/* Logo */}
          <div className="relative h-24 w-24 rounded-2xl border-4 border-background bg-card shadow-xl overflow-hidden shrink-0 z-10">
            {logoUrl ? (
              <Image src={logoUrl} alt={vendor.storeName} fill
                className="object-cover"
                unoptimized={process.env.NODE_ENV === 'development'} />
            ) : (
              <div className="flex h-full items-center justify-center bg-primary/10">
                <Store className="h-10 w-10 text-primary" />
              </div>
            )}
          </div>

          {/* Store name + meta */}
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{vendor.storeName}</h1>
              {isActive && (
                <Badge
                  className="bg-green-100 text-green-700 border-0 flex items-center gap-1 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              {!isActive && (
                <Badge variant="secondary" className="text-xs">
                  {vendor.status}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
              <span className="text-muted-foreground/60">marketplace.com/</span>
              {vendor.storeSlug}
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Rating',
              value: vendor.rating > 0 ? vendor.rating.toFixed(1) : '—',
              sub:   vendor.rating > 0 ? 'out of 5' : 'No reviews yet',
              icon:  Star,
              color: 'text-yellow-600',
              bg:    'bg-yellow-100 dark:bg-yellow-900/30',
            },
            {
              label: 'Total Sales',
              value: vendor.totalSales,
              sub:   'orders fulfilled',
              icon:  ShoppingBag,
              color: 'text-blue-600',
              bg:    'bg-blue-100 dark:bg-blue-900/30',
            },
            {
              label: 'Products',
              value: products.length,
              sub:   'active listings',
              icon:  Package,
              color: 'text-primary',
              bg:    'bg-primary/10',
            },
          ].map(s => (
            <div key={s.label}
              className="rounded-xl border bg-card p-4 flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── About + Contact ── */}
        {(vendor.description || vendor.email || vendor.phone) && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

              {/* Description */}
              {vendor.description && (
                <div className="rounded-xl border bg-card p-5 space-y-2">
                  <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    About
                  </h2>
                  <p className="text-sm leading-relaxed">
                    {vendor.description}
                  </p>
                </div>
              )}

              {/* Contact */}
              {(vendor.email || vendor.phone) && (
                <div className="rounded-xl border bg-card p-5 space-y-4">
                  <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Contact
                  </h2>
                  <div className="space-y-3">
                    {vendor.email && (
                      <a href={`mailto:${vendor.email}`}
                        className="flex items-center gap-3 text-sm group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                          {vendor.email}
                        </span>
                      </a>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground">{vendor.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Separator className="mb-8" />
          </>
        )}

        {/* ── Products ── */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              All Products
              {!productsLoading && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({products.length})
                </span>
              )}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/products?vendorId=${vendor.id}`}>
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center rounded-xl border bg-muted/30">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Package className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-semibold">No products yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This store hasn't listed any products yet
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/products">Browse other products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}