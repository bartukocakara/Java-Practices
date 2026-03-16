'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useCallback, useState, Suspense } from 'react';
import { useFilteredProducts } from '@/lib/hooks/useProducts';
import { useCategories } from '@/lib/hooks/useCategories';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Package } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Name A–Z',    value: 'name-asc'       },
  { label: 'Name Z–A',    value: 'name-desc'      },
  { label: 'Price: Low',  value: 'price-asc'      },
  { label: 'Price: High', value: 'price-desc'     },
  { label: 'Newest',      value: 'createdAt-desc' },
];

const PAGE_SIZE = 12;

// ── Skeleton — no hooks, just JSX ──
function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm">
      <Skeleton className="h-52 w-full shrink-0" />
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="space-y-1.5" style={{ minHeight: '2.5rem' }}>
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
        <div className="space-y-1.5 flex-1" style={{ minHeight: '2.5rem' }}>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50 mt-auto">
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-2.5 w-16" />
          </div>
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Main content — receives key from wrapper so it remounts on URL change ──
function ProductsContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read all params from URL
  const page       = Number(searchParams.get('page') ?? 0);
  const search     = searchParams.get('search')     ?? undefined;
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const minPrice   = searchParams.get('minPrice')   ? Number(searchParams.get('minPrice'))   : undefined;
  const maxPrice   = searchParams.get('maxPrice')   ? Number(searchParams.get('maxPrice'))   : undefined;
  const sort       = searchParams.get('sort') ?? 'name-asc';

  const sortParts  = sort.split('-');
  const direction  = sortParts[sortParts.length - 1];
  const sortBy     = sortParts.slice(0, -1).join('-');

  // Scroll to top on any param change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams.toString()]);

  const { data: categories } = useCategories();

  const { data, isLoading, isFetching } = useFilteredProducts({
    categoryId,
    minPrice,
    maxPrice,
    name:      search,
    page,
    size:      PAGE_SIZE,
    sortBy,
    direction,
  });

  const setParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== 'page') params.set('page', '0');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const clearAllFilters  = () => router.push(pathname, { scroll: false });
  const activeFilters    = [categoryId, minPrice, maxPrice, search].filter(Boolean).length;
  const selectedCategory = categories?.find(c => c.id === categoryId);
  const variedCount      = data?.content.filter(p => p.hasVariants).length ?? 0;

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>

        {/* Active filter chips */}
        {activeFilters > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {search && (
              <Badge variant="secondary" className="flex items-center gap-1.5 pr-1.5">
                Search: "{search}"
                <button onClick={() => setParam('search', null)}
                  className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="flex items-center gap-1.5 pr-1.5">
                {selectedCategory.name}
                <button onClick={() => setParam('categoryId', null)}
                  className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {minPrice && (
              <Badge variant="secondary" className="flex items-center gap-1.5 pr-1.5">
                Min: ${minPrice}
                <button onClick={() => setParam('minPrice', null)}
                  className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {maxPrice && (
              <Badge variant="secondary" className="flex items-center gap-1.5 pr-1.5">
                Max: ${maxPrice}
                <button onClick={() => setParam('maxPrice', null)}
                  className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
              Clear all
            </button>
          </div>
        )}

        {/* Results summary */}
        {data && !isLoading && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {data.totalElements} product{data.totalElements !== 1 ? 's' : ''} found
            </span>
            {variedCount > 0 && (
              <><span>·</span><span>{variedCount} with multiple options</span></>
            )}
            {isFetching && (
              <><span>·</span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" />
                Updating...
              </span></>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-8">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
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
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6">

            {/* Mobile filter sheet */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilters > 0 && (
                    <Badge variant="default"
                      className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
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
                  onClear={() => { clearAllFilters(); setMobileFiltersOpen(false); }}
                />
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground hidden sm:inline">Sort by</span>
              <Select value={sort} onValueChange={(val) => setParam('sort', val)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : data?.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Package className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-lg font-semibold">No products found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or search term
                </p>
              </div>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
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
              <Button variant="outline" size="sm" disabled={data.first}
                onClick={() => setParam('page', String(page - 1))}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: data.totalPages }).map((_, i) => {
                  const isActive     = i === page;
                  const show         = i === 0 || i === data.totalPages - 1 || Math.abs(i - page) <= 1;
                  const showEllipsis = !show && (i === 1 || i === data.totalPages - 2);
                  if (showEllipsis) return (
                    <span key={i} className="px-1 text-muted-foreground text-sm">…</span>
                  );
                  if (!show) return null;
                  return (
                    <Button key={i} variant={isActive ? 'default' : 'outline'}
                      size="sm" className="w-9 h-9"
                      onClick={() => setParam('page', String(i))}>
                      {i + 1}
                    </Button>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" disabled={data.last}
                onClick={() => setParam('page', String(page + 1))}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Page {page + 1} of {data.totalPages} · {data.totalElements} total products
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Wrapper: re-mounts ProductsContent on URL change via key prop ──
function ProductsContentWrapper() {
  const searchParams = useSearchParams();
  return <ProductsContent key={searchParams.toString()} />;
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContentWrapper />
    </Suspense>
  );
}