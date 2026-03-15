'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useFilteredProducts } from '@/lib/hooks/useProducts';
import { useCategories } from '@/lib/hooks/useCategories';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Suspense, useCallback, useState } from 'react';

const SORT_OPTIONS = [
  { label: 'Name A–Z',     value: 'name-asc' },
  { label: 'Name Z–A',     value: 'name-desc' },
  { label: 'Price: Low',   value: 'price-asc' },
  { label: 'Price: High',  value: 'price-desc' },
  { label: 'Newest',       value: 'createdAt-desc' },
];

const PAGE_SIZE = 12;

function ProductsContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read params from URL
  const page       = Number(searchParams.get('page') ?? 0);
  const search     = searchParams.get('search') ?? undefined;
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const minPrice   = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice   = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sort       = searchParams.get('sort') ?? 'name-asc';
  const [sortBy, direction] = sort.split('-') as [string, string];

  const { data: categories } = useCategories();

  const { data, isLoading, isFetching } = useFilteredProducts({
    categoryId,
    minPrice,
    maxPrice,
    name: search,
    page,
    size: PAGE_SIZE,
  });

  // Update URL params
  const setParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== 'page') params.set('page', '0');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const clearAllFilters = () => {
    router.push(pathname);
  };

  // Active filter count
  const activeFilters = [categoryId, minPrice, maxPrice, search].filter(Boolean).length;

  const selectedCategory = categories?.find(c => c.id === categoryId);

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{search}"
              <button onClick={() => setParam('search', null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedCategory.name}
              <button onClick={() => setParam('categoryId', null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {minPrice && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Min: ${minPrice}
              <button onClick={() => setParam('minPrice', null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {maxPrice && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Max: ${maxPrice}
              <button onClick={() => setParam('maxPrice', null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear all
            </button>
          )}
        </div>
        {data && (
          <p className="text-sm text-muted-foreground">
            {data.totalElements} product{data.totalElements !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      <div className="flex gap-8">

        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <ProductFilters
            categories={categories ?? []}
            selectedCategoryId={categoryId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategoryChange={(id) => setParam('categoryId', id ? String(id) : null)}
            onMinPriceChange={(val) => setParam('minPrice', val ? String(val) : null)}
            onMaxPriceChange={(val) => setParam('maxPrice', val ? String(val) : null)}
            onClear={clearAllFilters}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6">

            {/* Mobile Filter Button */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilters > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFilters}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto">
                <h2 className="font-semibold mb-4 mt-2">Filters</h2>
                <ProductFilters
                  categories={categories ?? []}
                  selectedCategoryId={categoryId}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onCategoryChange={(id) => {
                    setParam('categoryId', id ? String(id) : null);
                    setMobileFiltersOpen(false);
                  }}
                  onMinPriceChange={(val) => setParam('minPrice', val ? String(val) : null)}
                  onMaxPriceChange={(val) => setParam('maxPrice', val ? String(val) : null)}
                  onClear={() => {
                    clearAllFilters();
                    setMobileFiltersOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground hidden sm:inline">Sort by</span>
              <Select
                value={sort}
                onValueChange={(val) => setParam('sort', val)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
          ) : data?.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <Package className="h-16 w-16 text-muted-foreground/30" />
              <div>
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or search term
                </p>
              </div>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={`
                grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5
                transition-opacity duration-200
                ${isFetching ? 'opacity-60' : 'opacity-100'}
              `}>
                {data?.content.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="sm"
                disabled={data.first}
                onClick={() => setParam('page', String(page - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: data.totalPages }).map((_, i) => {
                  const isActive = i === page;
                  // Show first, last, current, and neighbors
                  const show = i === 0 || i === data.totalPages - 1 ||
                    Math.abs(i - page) <= 1;
                  const showEllipsis = !show &&
                    (i === 1 || i === data.totalPages - 2);

                  if (showEllipsis) {
                    return <span key={i} className="px-1 text-muted-foreground">…</span>;
                  }
                  if (!show) return null;

                  return (
                    <Button
                      key={i}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      className="w-9"
                      onClick={() => setParam('page', String(i))}
                    >
                      {i + 1}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={data.last}
                onClick={() => setParam('page', String(page + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}