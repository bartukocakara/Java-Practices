'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge }    from '@/components/ui/badge';
import { useApplyAsVendor, useVendorApplication } from '@/lib/hooks/useVendor';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const schema = z.object({
  storeName:   z.string().min(3, 'Store name must be at least 3 characters').max(100),
  description: z.string().min(20, 'Please describe your store (min 20 chars)').max(255),
  email:       z.string().email('Valid email required'),
  phone:       z.string().max(20).optional(),
  address:     z.string().max(255).optional(),
});

type FormData = z.infer<typeof schema>;

const STATUS_CONFIG = {
  PENDING:  { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  APPROVED: { label: 'Approved',     color: 'bg-green-100 text-green-800',   icon: CheckCircle },
  REJECTED: { label: 'Rejected',     color: 'bg-red-100 text-red-800',       icon: XCircle },
};

export default function VendorApplyPage() {
  const router              = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const { data: application, isLoading } = useVendorApplication();
  const { mutate: apply, isPending } = useApplyAsVendor();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Already a vendor — redirect to dashboard
  if (role === 'ROLE_VENDOR') {
    router.push('/vendor');
    return null;
  }

  const onSubmit = (data: FormData) => {
    apply(data, {
      onSuccess: () => toast.success('Application submitted! We\'ll review it shortly.'),
      onError: (err: any) =>
        toast.error(err?.response?.data?.message ?? 'Failed to submit application'),
    });
  };

  if (isLoading) return null;

  // Show status if already applied
  if (application) {
    const config     = STATUS_CONFIG[application.status];
    const StatusIcon = config.icon;
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Vendor Application</h2>
          <Badge className={`${config.color} border-0 flex items-center gap-1.5 w-fit mx-auto px-3 py-1`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {config.label}
          </Badge>
          <div className="text-sm text-muted-foreground space-y-1 text-left bg-muted/50 rounded-lg p-4">
            <p><span className="font-medium text-foreground">Store:</span> {application.storeName}</p>
            <p><span className="font-medium text-foreground">Applied:</span>{' '}
              {new Date(application.createdAt).toLocaleDateString()}
            </p>
            {application.adminNote && (
              <p><span className="font-medium text-foreground">Note:</span> {application.adminNote}</p>
            )}
          </div>

          {application.status === 'APPROVED' && (
            <Button className="w-full" asChild>
              <Link href="/vendor">Go to Vendor Dashboard</Link>
            </Button>
          )}
          {application.status === 'PENDING' && (
            <p className="text-xs text-muted-foreground">
              Applications are typically reviewed within 24–48 hours.
            </p>
          )}
          {application.status === 'REJECTED' && (
            <p className="text-xs text-muted-foreground">
              You may contact support for more information.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="max-w-lg w-full space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Become a Vendor</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Start selling on our marketplace. Fill out the form below and
            we'll review your application within 24–48 hours.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          {[
            { label: 'Commission',  value: '10%' },
            { label: 'Payout',      value: 'Weekly' },
            { label: 'Products',    value: 'Unlimited' },
          ].map(b => (
            <div key={b.label} className="rounded-xl border bg-card p-3">
              <p className="text-lg font-bold text-primary">{b.value}</p>
              <p className="text-muted-foreground">{b.label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="rounded-2xl border bg-card p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            <div className="space-y-1.5">
              <Label>Store Name *</Label>
              <Input
                placeholder="My Awesome Store"
                {...register('storeName')}
                className={errors.storeName ? 'border-destructive' : ''}
              />
              {errors.storeName && (
                <p className="text-xs text-destructive">{errors.storeName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Store Description *</Label>
              <Textarea
                placeholder="Tell us about your store, what you sell, your brand story..."
                rows={3}
                {...register('description')}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

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
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Phone <span className="text-muted-foreground">(optional)</span></Label>
                <Input placeholder="+90 555 000 0000" {...register('phone')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Business Address <span className="text-muted-foreground">(optional)</span></Label>
              <Input placeholder="123 Business St, City, Country" {...register('address')} />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              {isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                : 'Submit Application'
              }
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By applying you agree to our{' '}
              <span className="underline cursor-pointer">Vendor Terms of Service</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}