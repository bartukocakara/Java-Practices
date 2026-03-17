'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus, Search, Package, AlertTriangle,
  MoreVertical, Eye, Pencil, Trash2,
  ToggleLeft, ToggleRight, Filter,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { Badge }     from '@/components/ui/badge';
import { Skeleton }  from '@/components/ui/skeleton';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useVendorProducts, useDeleteVendorProduct,
  useUpdateVendorProductStatus,
} from '@/lib/hooks/useVendorProducts';
import { Product } from '@/types';
import { toast } from 'sonner';
import { VendorProductFormDialog } from '@/components/vendor/VendorProductFormDialog';

const API_BASE    = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9090';
const PAGE_SIZE   = 10;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE:  { label: 'Active',  color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  DRAFT:   { label: 'Draft',   color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
  PAUSED:  { label: 'Paused',  color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  DELETED: { label: 'Deleted', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export default function VendorProductsPage() {
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('ALL');
  const [lowStockOnly, setLowStockOnly]   = useState(false);
  const [deleteId, setDeleteId]           = useState<number | null>(null);
  const [editProduct, setEditProduct]     = useState<Product | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [page, setPage]                   = useState(0);

  const { data: products = [], isLoading } = useVendorProducts(
    statusFilter !== 'ALL' ? statusFilter : undefined,
    lowStockOnly || undefined
  );
  const { mutate: deleteProduct, isPending: deleting } = useDeleteVendorProduct();
  const { mutate: updateStatus }                       = useUpdateVendorProductStatus();

  // Filter
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    p.status !== 'DELETED'
  );

  // Pagination — reset to page 0 when filters change
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage    = Math.min(page, Math.max(0, totalPages - 1));
  const paginated   = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(0);
  };

  const handleLowStockToggle = () => {
    setLowStockOnly(p => !p);
    setPage(0);
  };

  const lowStockCount = products.filter(
    p => p.stock <= 5 && p.status === 'ACTIVE'
  ).length;

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct(deleteId, {
      onSuccess: () => { toast.success('Product deleted'); setDeleteId(null); },
      onError:   () => toast.error('Failed to delete product'),
    });
  };

  const handleToggleStatus = (product: Product) => {
    const next = product.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    updateStatus(
      { id: product.id, status: next },
      {
        onSuccess: () => toast.success(`Product ${next.toLowerCase()}`),
        onError:   () => toast.error('Failed to update status'),
      }
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">My Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== products.length && ` (filtered from ${products.length})`}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div
          onClick={() => { setLowStockOnly(true); setPage(0); }}
          className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 cursor-pointer hover:bg-destructive/15 transition-colors"
        >
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm font-medium text-destructive">
            {lowStockCount} product{lowStockCount !== 1 ? 's' : ''} running low on stock
            <span className="font-normal text-destructive/80 ml-1">— click to filter</span>
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={lowStockOnly ? 'default' : 'outline'}
          size="sm"
          onClick={handleLowStockToggle}
          className="flex items-center gap-1.5"
        >
          <Filter className="h-3.5 w-3.5" />
          Low Stock
        </Button>
      </div>

      {/* Product table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Package className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-semibold">No products found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? 'Try a different search term' : 'Add your first product to get started'}
            </p>
          </div>
          {!search && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">Category</th>
                  <th className="text-right p-3 font-medium">Price</th>
                  <th className="text-right p-3 font-medium">Stock</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginated.map(product => {
                  const config   = STATUS_CONFIG[product.status ?? 'DRAFT'] ?? STATUS_CONFIG.DRAFT;
                  const isLow    = product.stock <= 5 && product.stock > 0;
                  const isOut    = product.stock === 0;
                  const imageUrl = product.primaryImageUrl
                    ? `${API_BASE}${product.primaryImageUrl}` : null;

                  return (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">

                      {/* Product */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                            {imageUrl ? (
                              <Image src={imageUrl} alt={product.name} fill
                                className="object-cover" sizes="48px"
                                unoptimized={process.env.NODE_ENV === 'development'} />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {product.hasVariants
                                ? `${product.variants?.length ?? 0} variants`
                                : 'No variants'
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3 hidden sm:table-cell text-muted-foreground">
                        {product.categoryName ?? '—'}
                      </td>

                      {/* Price */}
                      <td className="p-3 text-right font-medium">
                        ${product.price.toFixed(2)}
                        {product.maxPrice && product.maxPrice !== product.price && (
                          <span className="text-xs text-muted-foreground block">
                            – ${product.maxPrice.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="p-3 text-right">
                        <span className={`font-medium ${
                          isOut ? 'text-destructive'
                            : isLow ? 'text-orange-500'
                              : 'text-foreground'
                        }`}>
                          {product.stock}
                        </span>
                        {isOut && <span className="block text-xs text-destructive">Out</span>}
                        {isLow && !isOut && <span className="block text-xs text-orange-500">Low</span>}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <Badge className={`${config.color} border-0 text-xs`}>
                          {config.label}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/vendor/products/${product.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditProduct(product)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(product)}>
                              {product.status === 'ACTIVE'
                                ? <><ToggleLeft className="h-4 w-4 mr-2" />Pause</>
                                : <><ToggleRight className="h-4 w-4 mr-2" />Activate</>
                              }
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(product.id)}
                              className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} products
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="sm"
                  disabled={safePage === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const show         = i === 0 || i === totalPages - 1 || Math.abs(i - safePage) <= 1;
                    const showEllipsis = !show && (i === 1 || i === totalPages - 2);
                    if (showEllipsis) return (
                      <span key={i} className="px-1 text-muted-foreground text-sm">…</span>
                    );
                    if (!show) return null;
                    return (
                      <Button
                        key={i}
                        variant={safePage === i ? 'default' : 'outline'}
                        size="sm"
                        className="w-9 h-9"
                        onClick={() => setPage(i)}
                      >
                        {i + 1}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline" size="sm"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the product and remove it from the store.
              Orders already placed will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create form dialog */}
      <VendorProductFormDialog
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
      />

      {/* Edit form dialog */}
      <VendorProductFormDialog
        open={!!editProduct}
        onOpenChange={(open: boolean) => !open && setEditProduct(null)}
        product={editProduct ?? undefined}
      />
    </div>
  );
}