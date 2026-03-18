'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ShoppingBag, MapPin, Phone, User,
  FileText, Clock, CheckCircle, Truck, XCircle,
  ChevronRight, DollarSign, Percent, CreditCard,
  Banknote,
} from 'lucide-react';
import { Button }    from '@/components/ui/button';
import { Badge }     from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton }  from '@/components/ui/skeleton';
import {
  useVendorOrder,
  useUpdateVendorOrderStatus,
} from '@/lib/hooks/useVendorOrders';
import { toast } from 'sonner';

const COMMISSION_RATE = 0.10;

const STATUS_CONFIG: Record<string, {
  label: string; color: string; icon: any;
}> = {
  PENDING:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock       },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',         icon: CheckCircle },
  SHIPPED:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: Truck       },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',     icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',             icon: XCircle     },
};

const NEXT_STATUSES: Record<string, Array<{
  status: string; label: string; variant: 'default' | 'outline';
}>> = {
  PENDING:   [
    { status: 'CONFIRMED', label: 'Confirm Order',     variant: 'default' },
    { status: 'CANCELLED', label: 'Cancel Order',      variant: 'outline' },
  ],
  CONFIRMED: [
    { status: 'SHIPPED',   label: 'Mark as Shipped',   variant: 'default' },
    { status: 'CANCELLED', label: 'Cancel Order',      variant: 'outline' },
  ],
  SHIPPED:   [
    { status: 'DELIVERED', label: 'Mark as Delivered', variant: 'default' },
  ],
  DELIVERED: [],
  CANCELLED: [],
};

const TIMELINE = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as const;

const fmt = (v?: number) => (v ?? 0).toFixed(2);

export default function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = use(params);
  const orderId = Number(id);

  const { data: order, isLoading }            = useVendorOrder(orderId);
  const { mutate: updateStatus, isPending }   = useUpdateVendorOrderStatus();

  const handleStatus = (newStatus: string) => {
    updateStatus(
      { id: orderId, status: newStatus },
      {
        onSuccess: () =>
          toast.success(`Order marked as ${newStatus.toLowerCase()}`),
        onError: (err: any) =>
          toast.error(err?.response?.data?.message ?? 'Failed to update'),
      }
    );
  };

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );

  if (!order) return (
    <div className="text-center py-20">
      <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
      <p className="font-semibold">Order not found</p>
      <Button variant="outline" size="sm" className="mt-4" asChild>
        <Link href="/vendor/orders">Back to Orders</Link>
      </Button>
    </div>
  );

  const config       = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon   = config.icon;
  const nextActions  = NEXT_STATUSES[order.status] ?? [];
  const subtotal     = order.totalAmount;
  const commission   = subtotal * COMMISSION_RATE;
  const netEarnings  = subtotal - commission;
  const isCancelled  = order.status === 'CANCELLED';
  const isDelivered  = order.status === 'DELIVERED';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/vendor/orders">
              <ArrowLeft className="h-4 w-4 mr-1" /> Orders
            </Link>
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          <h1 className="text-xl font-bold">Order #{order.id}</h1>
          <Badge className={`${config.color} border-0 flex items-center gap-1`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {config.label}
          </Badge>
        </div>

        {/* Action buttons */}
        {nextActions.length > 0 && (
          <div className="flex items-center gap-2">
            {nextActions.map(action => (
              <Button
                key={action.status}
                size="sm"
                variant={action.variant}
                className={action.status === 'CANCELLED'
                  ? 'border-destructive text-destructive hover:bg-destructive/10'
                  : ''}
                onClick={() => handleStatus(action.status)}
                disabled={isPending}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Date */}
      <p className="text-sm text-muted-foreground -mt-2">
        Placed {new Date(order.createdAt).toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric',
          month: 'long', day: 'numeric',
        })} at {new Date(order.createdAt).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
        })}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Items */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b bg-muted/30">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">
                Order Items ({order.items.length})
              </h2>
            </div>
            <div className="divide-y">
              {order.items.map(item => (
                <div key={item.id}
                  className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0 font-bold text-primary text-sm">
                      {item.quantity}×
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm line-clamp-1">
                        {item.productName}
                      </p>
                      {item.variantInfo &&
                        Object.keys(item.variantInfo).length > 0 && (
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                          {Object.entries(item.variantInfo).map(([k, v]) => (
                            <span key={k}
                              className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <p className="font-semibold text-sm">
                      ${fmt(item.subtotal)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${fmt(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Items total */}
            <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-t">
              <span className="text-sm font-medium">Items Total</span>
              <span className="font-bold">${fmt(subtotal)}</span>
            </div>
          </div>

          {/* Earnings */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Earnings Breakdown
            </h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Gross Revenue</span>
                <span className="font-medium">${fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5" />
                  Platform Commission (10%)
                </span>
                <span className="font-medium text-destructive">
                  − ${fmt(commission)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-semibold text-base">
                <span>Net Earnings</span>
                <span className={isDelivered
                  ? 'text-green-600'
                  : 'text-muted-foreground'}>
                  ${fmt(netEarnings)}
                </span>
              </div>
            </div>
            {!isDelivered && !isCancelled && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                💡 Earnings are finalized when the order status is Delivered
              </p>
            )}
            {isCancelled && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                This order was cancelled — no earnings will be processed
              </p>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                Customer Notes
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* ── Right ── */}
        <div className="space-y-4">

          {/* Customer */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Customer
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="font-medium">{order.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{order.phone}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Shipping Address
            </h2>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p className="font-medium text-foreground">{order.fullName}</p>
              <p>{order.addressLine}</p>
              <p>{order.city}, {order.country}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              {order.paymentMethod === 'CREDIT_CARD'
                ? <CreditCard className="h-4 w-4 text-primary" />
                : <Banknote    className="h-4 w-4 text-primary" />
              }
              Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">
                  {order.paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'Cash on Delivery'
                    : 'Credit Card'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={isDelivered ? 'default' : 'secondary'}
                  className="text-xs">
                  {isDelivered ? 'Paid' : isCancelled ? 'Cancelled' : 'Pending'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-primary">
                  ${fmt(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Order Timeline</h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-3.5 top-3 bottom-3 w-px bg-border" />

              <div className="space-y-4">
                {TIMELINE.map(s => {
                  const conf       = STATUS_CONFIG[s];
                  const Icon       = conf.icon;
                  const statuses   = [...TIMELINE];
                  const currentIdx = isCancelled
                    ? -1
                    : statuses.indexOf(order.status as typeof TIMELINE[number]);
                  const stepIdx    = statuses.indexOf(s);
                  const isDone     = !isCancelled && stepIdx <= currentIdx;
                  const isCurrent  = !isCancelled && s === order.status;

                  return (
                    <div key={s} className="flex items-center gap-3 relative">
                      <div className={`
                        flex h-7 w-7 items-center justify-center rounded-full
                        shrink-0 z-10 transition-colors
                        ${isCurrent
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : isDone
                            ? 'bg-green-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className={`text-sm ${
                        isCurrent
                          ? 'font-semibold text-foreground'
                          : isDone
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                      }`}>
                        {conf.label}
                      </span>
                      {isCurrent && (
                        <span className="ml-auto text-xs text-primary font-medium">
                          Current
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Cancelled state */}
                {isCancelled && (
                  <div className="flex items-center gap-3 relative">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white shrink-0 z-10">
                      <XCircle className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-semibold text-destructive">
                      Cancelled
                    </span>
                    <span className="ml-auto text-xs text-destructive font-medium">
                      Current
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}