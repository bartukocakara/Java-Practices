'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle, Package, MapPin, CreditCard,
  Truck, Clock, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrder } from '@/lib/hooks/useOrders';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200',       icon: CheckCircle },
  SHIPPED:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200',    icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200',          icon: Package },
};

export default function OrderDetailPage() {
  const { id }                    = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(Number(id));

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Order not found</h2>
        <Button asChild><Link href="/profile/orders">My Orders</Link></Button>
      </div>
    );
  }

  const statusConfig   = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon     = statusConfig.icon;
  const currentStep    = STATUS_STEPS.indexOf(order.status);
  const isCancelled    = order.status === 'CANCELLED';
  const fmt = (val: number | undefined | null) =>
    (val ?? 0).toFixed(2);
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/profile/orders" className="hover:text-foreground">My Orders</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Order #{order.id}</span>
      </nav>

      {/* Success Banner */}
      {order.status === 'PENDING' && (
        <div className="mb-6 p-5 rounded-xl bg-green-50 border border-green-200 flex items-center gap-4">
          <CheckCircle className="h-10 w-10 text-green-500 shrink-0" />
          <div>
            <h2 className="font-semibold text-green-800">Order Placed Successfully!</h2>
            <p className="text-sm text-green-600 mt-0.5">
              Thank you for your order. We'll start processing it right away.
            </p>
          </div>
        </div>
      )}

      {/* Order Header */}
      <div className="rounded-xl border bg-card p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold">Order #{order.id}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
          <Badge className={`${statusConfig.color} border flex items-center gap-1.5 px-3 py-1`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Progress Bar */}
        {/* Progress Bar */}
    {!isCancelled && (
    <div className="mt-8">
        {/* Line first */}
        <div className="relative h-1 bg-muted rounded-full mx-4 mb-4">
        <div
            className="absolute h-full bg-primary rounded-full transition-all duration-500"
            style={{
            width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%`
            }}
        />
        {/* Dots on the line */}
        {STATUS_STEPS.map((step, idx) => {
            const done    = idx <= currentStep;
            const current = idx === currentStep;
            const pct     = (idx / (STATUS_STEPS.length - 1)) * 100;
            return (
            <div
                key={step}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${pct}%` }}
            >
                <div className={`h-4 w-4 rounded-full border-2 transition-colors bg-background ${
                done
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30'
                } ${current ? 'ring-2 ring-primary ring-offset-2' : ''}`} />
            </div>
            );
        })}
        </div>

        {/* Labels below */}
        <div className="flex justify-between px-2">
        {STATUS_STEPS.map((step, idx) => {
            const done = idx <= currentStep;
            return (
            <div key={step} className="flex flex-col items-center" style={{ width: '25%' }}>
                <span className={`text-xs text-center ${
                done ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                {STATUS_CONFIG[step]?.label}
                </span>
            </div>
            );
        })}
        </div>
    </div>
    )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

        {/* Shipping Address */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Shipping Address</h3>
          </div>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p className="font-medium text-foreground">{order.fullName}</p>
            <p>{order.phone}</p>
            <p>{order.addressLine}</p>
            <p>{order.city}, {order.country}</p>
          </div>
          {order.notes && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Notes: </span>
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Payment Info */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Payment</h3>
          </div>
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              {order.paymentMethod === 'CASH_ON_DELIVERY' ? (
                <>
                  <Truck className="h-4 w-4 text-green-500" />
                  <span>Cash on Delivery</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <span>Credit Card</span>
                </>
              )}
            </div>
            <Separator />
            <div className="space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${fmt(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t">
                <span>Total Paid</span>
                <span className="text-primary">${fmt(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-4">
          Items ({order.items.length})
        </h3>
        <div className="divide-y">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted shrink-0">
                <Package className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  ${fmt(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold shrink-0">
                ${fmt(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between font-bold">
          <span>Order Total</span>
          <span className="text-primary text-lg">${fmt(order.totalAmount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 justify-end">
        <Button variant="outline" asChild>
          <Link href="/profile/orders">All Orders</Link>
        </Button>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}