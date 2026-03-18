'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Store, Upload, Camera, Star, ShoppingBag,
  Percent, Globe, Loader2, CheckCircle,
} from 'lucide-react';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { Label }     from '@/components/ui/label';
import { Textarea }  from '@/components/ui/textarea';
import { Badge }     from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton }  from '@/components/ui/skeleton';
import {
  useVendorStore, useUpdateVendorStore,
  useUploadVendorLogo, useUploadVendorBanner,
} from '@/lib/hooks/useVendorStore';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9090';

const schema = z.object({
  storeName:   z.string().min(2).max(100),
  description: z.string().max(1000).default(''),
  email:       z.string().email(),
  phone:       z.string().max(20).default(''),
  address:     z.string().max(255).default(''),
});

type StoreFormValues = z.infer<typeof schema>;

export default function VendorStorePage() {
  const logoRef   = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const { data: store, isLoading }                    = useVendorStore();
  const { mutate: updateStore, isPending: saving }    = useUpdateVendorStore();
  const { mutate: uploadLogo, isPending: logoUploading }     = useUploadVendorLogo();
  const { mutate: uploadBanner, isPending: bannerUploading } = useUploadVendorBanner();

  const {
    register, handleSubmit, reset,
    formState: { errors, isDirty },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      storeName: '', description: '',
      email: '', phone: '', address: '',
    },
  });

  useEffect(() => {
    if (store) {
      reset({
        storeName:   store.storeName   ?? '',
        description: store.description ?? '',
        email:       store.email       ?? '',
        phone:       store.phone       ?? '',
        address:     '',
      });
    }
  }, [store, reset]);

  const onSubmit = (data: StoreFormValues) => {
    updateStore(data, {
      onSuccess: () => toast.success('Store updated successfully'),
      onError:   (err: any) =>
        toast.error(err?.response?.data?.message ?? 'Failed to update store'),
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadLogo(file, {
      onSuccess: () => toast.success('Logo updated'),
      onError:   () => toast.error('Failed to upload logo'),
    });
    e.target.value = '';
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadBanner(file, {
      onSuccess: () => toast.success('Banner updated'),
      onError:   () => toast.error('Failed to upload banner'),
    });
    e.target.value = '';
  };

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );

  const logoUrl   = store?.logoUrl
    ? `${API_BASE}${store.logoUrl}` : null;
  const bannerUrl = store?.bannerUrl
    ? `${API_BASE}${store.bannerUrl}` : null;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Store</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your store profile and appearance
        </p>
      </div>

      {/* Store stats */}
      {store && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Rating',      value: store.rating.toFixed(1), icon: Star,        color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
            { label: 'Total Sales', value: store.totalSales,        icon: ShoppingBag, color: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30'   },
            { label: 'Commission',  value: `${store.commissionRate}%`, icon: Percent,  color: 'text-primary',    bg: 'bg-primary/10'                      },
          ].map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-4 space-y-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Banner */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Store Banner</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recommended: 1200×300px
          </p>
        </div>
        <div className="relative">
          {/* Banner area */}
          <div
            onClick={() => bannerRef.current?.click()}
            className="relative h-40 bg-gradient-to-br from-muted to-muted/50 cursor-pointer group overflow-hidden"
          >
            {bannerUrl ? (
              <Image src={bannerUrl} alt="Store banner" fill
                className="object-cover"
                unoptimized={process.env.NODE_ENV === 'development'} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground/50">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Click to upload banner</p>
                </div>
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                {bannerUploading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Upload className="h-4 w-4" />
                }
                {bannerUploading ? 'Uploading...' : 'Change Banner'}
              </div>
            </div>
          </div>

          {/* Logo on banner */}
          <div className="absolute -bottom-8 left-6">
            <div
              onClick={() => logoRef.current?.click()}
              className="relative h-16 w-16 rounded-xl border-4 border-card bg-muted cursor-pointer group overflow-hidden shadow-md"
            >
              {logoUrl ? (
                <Image src={logoUrl} alt="Store logo" fill
                  className="object-cover"
                  unoptimized={process.env.NODE_ENV === 'development'} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Store className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {logoUploading
                  ? <Loader2 className="h-3 w-3 text-white animate-spin" />
                  : <Camera className="h-3 w-3 text-white" />
                }
              </div>
            </div>
          </div>
        </div>

        {/* Store name below banner */}
        <div className="px-6 pt-12 pb-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-bold text-lg">{store?.storeName}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                /{store?.storeSlug}
              </div>
            </div>
            <Badge
              variant={store?.status === 'ACTIVE' ? 'default' : 'secondary'}
              className="ml-auto text-xs">
              {store?.status}
            </Badge>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input ref={logoRef}   type="file" accept="image/*"
          className="hidden" onChange={handleLogoUpload} />
        <input ref={bannerRef} type="file" accept="image/*"
          className="hidden" onChange={handleBannerUpload} />
      </div>

      {/* Store info form */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-5">Store Information</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Store Name *</Label>
              <Input
                placeholder="My Awesome Store"
                {...register('storeName')}
                className={errors.storeName ? 'border-destructive' : ''}
              />
              {errors.storeName && (
                <p className="text-xs text-destructive">
                  {errors.storeName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Store Slug</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted text-sm text-muted-foreground">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                /{store?.storeSlug}
              </div>
              <p className="text-xs text-muted-foreground">
                Slug cannot be changed after creation
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              placeholder="Tell customers about your store..."
              rows={4}
              {...register('description')}
            />
            <p className="text-xs text-muted-foreground">
              This appears on your public store page
            </p>
          </div>

          <Separator />

          <h3 className="font-medium text-sm">Contact Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Business Email *</Label>
              <Input
                type="email"
                placeholder="store@example.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                placeholder="+1 555 000 0000"
                {...register('phone')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Business Address</Label>
            <Input
              placeholder="123 Business St, City, Country"
              {...register('address')}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isDirty ? (
              <p className="text-xs text-orange-500">
                You have unsaved changes
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                All changes are saved
              </p>
            )}
            <Button type="submit" disabled={saving || !isDirty}>
              {saving
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                : <><CheckCircle className="mr-2 h-4 w-4" />Save Changes</>
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}