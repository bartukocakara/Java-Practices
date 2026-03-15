'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBag, Star, Truck, Shield, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFilteredProducts } from '@/lib/hooks/useProducts';
import { useCategories } from '@/lib/hooks/useCategories';
import { ProductCard } from '@/components/product/ProductCard';

const FEATURES = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On all orders over $50',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure transactions',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: Star,
    title: 'Top Rated',
    description: 'Trusted by thousands',
  },
];

export default function HomePage() {
  const { data: featuredProducts, isLoading: productsLoading } = useFilteredProducts({
    page: 0,
    size: 8,
  });

  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Only root categories
  const rootCategories = categories?.filter(c => c.parentId === null).slice(0, 6) ?? [];

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl space-y-6">
            <Badge variant="secondary" className="w-fit">
              <TrendingUp className="mr-1 h-3 w-3" />
              New arrivals every week
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Shop the Best
              <span className="text-primary block">Marketplace</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Discover thousands of products across every category.
              Quality guaranteed, fast delivery, easy returns.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" asChild>
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products">
                  Browse Categories
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-16 -bottom-16 h-[300px] w-[300px] rounded-full bg-primary/10 blur-2xl" />
      </section>

      {/* ── Features ── */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Shop by Category</h2>
            <p className="text-muted-foreground text-sm mt-1">Find exactly what you're looking for</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {rootCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border bg-card p-4 text-center transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Featured Products ── */}
      <section className="bg-muted/30 border-t border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Featured Products</h2>
              <p className="text-muted-foreground text-sm mt-1">Handpicked for you</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">
                See all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts?.content.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-12 text-primary-foreground text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to start shopping?</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            Join thousands of happy customers. Sign up today and get access to exclusive deals.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-white/5" />
        </div>
      </section>

    </div>
  );
}