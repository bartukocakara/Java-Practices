'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useCreateVendorProduct, useUpdateVendorProduct,
} from '@/lib/hooks/useVendorProducts';
import { useCategories } from '@/lib/hooks/useCategories';
import { Product } from '@/types';
import { toast } from 'sonner';

const schema = z.object({
  name:        z.string().min(2).max(255),
  description: z.string().max(2000).default(''),   // ← default instead of optional
  price:       z.coerce.number().min(0.01),
  stock:       z.coerce.number().int().min(0),
  categoryId:  z.coerce.number().min(1, 'Select a category'),
  status:      z.string().default('ACTIVE'),
});

// ← Renamed from FormData to ProductFormValues to avoid conflict with browser's FormData
type ProductFormValues = z.infer<typeof schema>;

interface Props {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  product?:     Product;
}

export function VendorProductFormDialog({ open, onOpenChange, product }: Props) {
  const { data: categories = [] }               = useCategories();
  const { mutate: create, isPending: creating } = useCreateVendorProduct();
  const { mutate: update, isPending: updating } = useUpdateVendorProduct();

  const isEdit = !!product;

  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors },
  } = useForm<ProductFormValues, unknown, ProductFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      status:      'ACTIVE',
      stock:       0,
      price:       0,
      description: '',
      categoryId:  0,
      name:        '',
    },
  });

  const status = watch('status');

  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          name:        product.name,
          description: product.description ?? '',
          price:       product.price,
          stock:       product.stock,
          categoryId:  0,
          status:      product.status ?? 'ACTIVE',
        });
      } else {
        reset({
          name:        '',
          description: '',
          price:       0,
          stock:       0,
          categoryId:  0,
          status:      'ACTIVE',
        });
      }
    }
  }, [open, product, reset]);

  const onSubmit = (data: ProductFormValues) => {
    // Ensure description is never undefined
    const payload = {
      ...data,
      description: data.description ?? '',
    };

    if (isEdit) {
      update(
        { id: product!.id, data: payload },
        {
          onSuccess: () => { toast.success('Product updated'); onOpenChange(false); },
          onError:   (err: any) =>
            toast.error(err?.response?.data?.message ?? 'Failed to update'),
        }
      );
    } else {
      create(payload, {
        onSuccess: () => { toast.success('Product created'); onOpenChange(false); },
        onError:   (err: any) =>
          toast.error(err?.response?.data?.message ?? 'Failed to create'),
      });
    }
  };

  const isPending = creating || updating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          <div className="space-y-1.5">
            <Label>Product Name *</Label>
            <Input
              placeholder="e.g. Premium Wireless Headphones"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe your product..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Price ($) *</Label>
              <Input
                type="number" step="0.01" placeholder="0.00"
                {...register('price')}
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Stock *</Label>
              <Input
                type="number" placeholder="0"
                {...register('stock')}
                className={errors.stock ? 'border-destructive' : ''}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select onValueChange={v => setValue('categoryId', Number(v))}>
              <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter(c => !c.hasChildren)
                  .map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.parentName ? `${c.parentName} › ` : ''}{c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={v => setValue('status', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button" variant="outline" className="flex-1"
              onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}