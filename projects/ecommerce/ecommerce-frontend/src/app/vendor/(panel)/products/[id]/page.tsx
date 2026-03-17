'use client';

import { use, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Package, Star, DollarSign, ShoppingBag,
  TrendingUp, Plus, Pencil, Trash2, Upload, Check,
  AlertTriangle, ImageIcon, ChevronRight
} from 'lucide-react';
import { Button }    from '@/components/ui/button';
import { Badge }     from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton }  from '@/components/ui/skeleton';
import { Input }     from '@/components/ui/input';
import { Label }     from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useVendorProduct, useVendorProductStats,
  useDeleteVariant, useUpdateVariantStock,
  useUploadProductImage, useDeleteProductImage,
  useSetPrimaryImage, useAddVariant,
} from '@/lib/hooks/useVendorProducts';
import { ProductVariantResponse } from '@/types';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9090';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE:  { label: 'Active',  color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  DRAFT:   { label: 'Draft',   color: 'bg-gray-100 text-gray-800' },
  PAUSED:  { label: 'Paused',  color: 'bg-yellow-100 text-yellow-800' },
  DELETED: { label: 'Deleted', color: 'bg-red-100 text-red-800' },
};

export default function VendorProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = use(params);
  const productId     = Number(idStr);

  const { data: product, isLoading } = useVendorProduct(productId);
  const { data: stats }              = useVendorProductStats(productId);

  const { mutate: deleteVariant }       = useDeleteVariant();
  const { mutate: updateVariantStock }  = useUpdateVariantStock();
  const { mutate: uploadImage, isPending: uploading } = useUploadProductImage();
  const { mutate: deleteImage }         = useDeleteProductImage();
  const { mutate: setPrimary }          = useSetPrimaryImage();
  const { mutate: addVariant, isPending: addingVariant } = useAddVariant();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editStockVariant, setEditStockVariant] =
    useState<ProductVariantResponse | null>(null);
  const [newStock, setNewStock]       = useState('');
  const [deleteVariantId, setDeleteVariantId] = useState<number | null>(null);
  const [showAddVariant, setShowAddVariant]   = useState(false);
  const [newVariant, setNewVariant] = useState({
    sku: '', price: '', stock: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadImage(
      { id: productId, file },
      {
        onSuccess: () => toast.success('Image uploaded'),
        onError:   () => toast.error('Failed to upload image'),
      }
    );
    e.target.value = '';
  };

  const handleUpdateStock = () => {
    if (!editStockVariant) return;
    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) {
      toast.error('Enter a valid stock number');
      return;
    }
    updateVariantStock(
      { id: productId, variantId: editStockVariant.id, stock },
      {
        onSuccess: () => {
          toast.success('Stock updated');
          setEditStockVariant(null);
          setNewStock('');
        },
        onError: () => toast.error('Failed to update stock'),
      }
    );
  };

  const handleAddVariant = () => {
    if (!newVariant.sku || !newVariant.price || !newVariant.stock) {
      toast.error('Fill all variant fields');
      return;
    }
    addVariant(
      {
        id: productId,
        data: {
          sku:   newVariant.sku,
          price: Number(newVariant.price),
          stock: Number(newVariant.stock),
        },
      },
      {
        onSuccess: () => {
          toast.success('Variant added');
          setShowAddVariant(false);
          setNewVariant({ sku: '', price: '', stock: '' });
        },
        onError: (err: any) =>
          toast.error(err?.response?.data?.message ?? 'Failed to add variant'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
        <p className="font-semibold">Product not found</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/vendor/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  const config    = STATUS_CONFIG[product.status ?? 'DRAFT'] ?? STATUS_CONFIG.DRAFT;
  const images    = product.images ?? [];
  const variants  = product.variants ?? [];

  const STAT_CARDS = [
    {
      label: 'Revenue',
      value: `$${Number(stats?.revenue ?? 0).toFixed(2)}`,
      icon:  DollarSign,
      color: 'text-green-600',
      bg:    'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Units Sold',
      value: stats?.unitsSold ?? 0,
      icon:  ShoppingBag,
      color: 'text-blue-600',
      bg:    'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Avg Rating',
      value: Number(stats?.averageRating ?? 0).toFixed(1),
      icon:  Star,
      color: 'text-yellow-600',
      bg:    'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Reviews',
      value: stats?.reviewCount ?? 0,
      icon:  TrendingUp,
      color: 'text-purple-600',
      bg:    'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vendor/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Products
          </Link>
        </Button>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold line-clamp-1">{product.name}</h1>
            <Badge className={`${config.color} border-0`}>{config.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {product.categoryName} · SKU: PRD-{String(product.id).padStart(5, '0')}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/products/${product.slug}`} target="_blank">
            View in Store
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(s => (
          <div key={s.label} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="variants">
            Variants ({variants.length})
          </TabsTrigger>
          <TabsTrigger value="images">
            Images ({images.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Product info */}
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Product Details</h3>
              <div className="space-y-0.5">
                {[
                  { label: 'Name',        value: product.name },
                  { label: 'Category',    value: product.categoryName ?? '—' },
                  { label: 'Base Price',  value: `$${product.price.toFixed(2)}` },
                  { label: 'Stock',       value: String(product.stock) },
                  { label: 'Has Variants',value: product.hasVariants ? 'Yes' : 'No' },
                  { label: 'Slug',        value: product.slug },
                ].map(({ label, value }, idx) => (
                  <div key={label}
                    className={`flex justify-between py-2.5 border-b last:border-0 text-sm ${
                      idx % 2 === 0 ? '' : ''
                    }`}>
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium break-all text-right max-w-[55%]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description || 'No description provided.'}
              </p>

              {product.stock <= 5 && product.stock > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 mt-4">
                  <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                  <p className="text-xs text-orange-700 dark:text-orange-400">
                    Low stock — only {product.stock} units remaining
                  </p>
                </div>
              )}
              {product.stock === 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mt-4">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">Out of stock</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Variants ── */}
        <TabsContent value="variants" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Product Variants</h3>
            <Button size="sm" onClick={() => setShowAddVariant(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>

          {variants.length === 0 ? (
            <div className="text-center py-12 border rounded-xl bg-muted/30">
              <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No variants yet</p>
              <Button size="sm" variant="outline" className="mt-3"
                onClick={() => setShowAddVariant(true)}>
                Add First Variant
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Variant</th>
                    <th className="text-left p-3 font-medium">SKU</th>
                    <th className="text-right p-3 font-medium">Price</th>
                    <th className="text-right p-3 font-medium">Stock</th>
                    <th className="text-center p-3 font-medium">Status</th>
                    <th className="text-center p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {variants.map(v => (
                    <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-medium">{v.displayLabel}</td>
                      <td className="p-3 text-muted-foreground font-mono text-xs">
                        {v.sku}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        ${v.price.toFixed(2)}
                      </td>
                      <td className={`p-3 text-right font-bold ${
                        v.stock === 0 ? 'text-destructive'
                          : v.stock <= 5 ? 'text-orange-500'
                            : 'text-green-600'
                      }`}>
                        {v.stock}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={v.stock > 0 && v.isActive ? 'default' : 'secondary'}
                          className="text-xs">
                          {!v.isActive ? 'Inactive'
                            : v.stock === 0 ? 'Out of Stock'
                              : 'Available'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setEditStockVariant(v);
                              setNewStock(String(v.stock));
                            }}>
                            <Pencil className="h-3 w-3 mr-1" />
                            Stock
                          </Button>
                          <Button variant="ghost" size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => setDeleteVariantId(v.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ── Images ── */}
        <TabsContent value="images" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Product Images</h3>
            <Button size="sm" onClick={() => fileInputRef.current?.click()}
              disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {images.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/30 transition-colors gap-3">
              <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Click to upload product images
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map(img => (
                <div key={img.id}
                  className="relative group rounded-xl overflow-hidden aspect-square border bg-muted">
                  <Image
                    src={`${API_BASE}${img.imageUrl}`}
                    alt="Product image"
                    fill className="object-cover"
                    sizes="200px"
                    unoptimized={process.env.NODE_ENV === 'development'}
                  />
                  {img.isPrimary && (
                    <div className="absolute top-2 left-2">
                      <Badge className="text-[10px] bg-primary px-1.5 py-0.5">
                        Primary
                      </Badge>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isPrimary && (
                      <Button size="sm" variant="secondary"
                        className="h-7 text-xs"
                        onClick={() => setPrimary(
                          { id: productId, imageId: img.id },
                          { onSuccess: () => toast.success('Primary image set') }
                        )}>
                        <Check className="h-3 w-3 mr-1" />
                        Set Primary
                      </Button>
                    )}
                    <Button size="sm" variant="destructive"
                      className="h-7 text-xs"
                      onClick={() => deleteImage(
                        { id: productId, imageId: img.id },
                        { onSuccess: () => toast.success('Image deleted') }
                      )}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Upload more */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/30 transition-colors gap-2">
                <Plus className="h-8 w-8 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground">Add more</span>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit stock dialog */}
      <Dialog
        open={!!editStockVariant}
        onOpenChange={() => setEditStockVariant(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Variant: <span className="font-medium text-foreground">
                {editStockVariant?.displayLabel}
              </span>
            </p>
            <div className="space-y-1.5">
              <Label>New Stock Quantity</Label>
              <Input
                type="number" min="0"
                value={newStock}
                onChange={e => setNewStock(e.target.value)}
                placeholder="Enter stock amount"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1"
                onClick={() => setEditStockVariant(null)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpdateStock}>
                Update Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add variant dialog */}
      <Dialog open={showAddVariant} onOpenChange={setShowAddVariant}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Variant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>SKU *</Label>
              <Input placeholder="e.g. PROD-001-BLK-XL"
                value={newVariant.sku}
                onChange={e => setNewVariant(p => ({ ...p, sku: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Price ($) *</Label>
                <Input type="number" step="0.01" placeholder="0.00"
                  value={newVariant.price}
                  onChange={e => setNewVariant(p => ({ ...p, price: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Stock *</Label>
                <Input type="number" placeholder="0"
                  value={newVariant.stock}
                  onChange={e => setNewVariant(p => ({ ...p, stock: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1"
                onClick={() => setShowAddVariant(false)}>
                Cancel
              </Button>
              <Button className="flex-1"
                onClick={handleAddVariant}
                disabled={addingVariant}>
                Add Variant
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete variant confirmation */}
      <AlertDialog
        open={!!deleteVariantId}
        onOpenChange={() => setDeleteVariantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete variant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this variant and its stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleteVariantId) return;
                deleteVariant(
                  { id: productId, variantId: deleteVariantId },
                  {
                    onSuccess: () => {
                      toast.success('Variant deleted');
                      setDeleteVariantId(null);
                    },
                    onError: () => toast.error('Failed to delete variant'),
                  }
                );
              }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}