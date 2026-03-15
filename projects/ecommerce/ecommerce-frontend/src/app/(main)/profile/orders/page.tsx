'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package, ChevronRight, Clock, CheckCircle,
  Truck, ShoppingBag, XCircle, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyOrders } from '@/lib/hooks/useOrders';
import { useAuthStore } from '@/store/authStore';
import { Order } from '@/types';

const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  icon: any;
}> = {
  PENDING:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',           icon: CheckCircle },
  SHIPPED:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',      icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',                icon: XCircle },
};

function OrderCard({ order }: { order: Order }) {
  const config     = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = config.icon;
  const itemCount  = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const fmt        = (val: number) => (val ?? 0).toFixed(2);

  return (
    <Link href={`/profile/orders/${order.id}`}>
      <div className="rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200 p-5 group">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Order #{order.id}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${config.color} border flex items-center gap-1 text-xs`}>
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Items preview */}
        <div className="space-y-2 mb-4">
          {order.items.slice(0, 2).map(item => (
            <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-bold text-muted-foreground shrink-0">
                  {item.quantity}
                </div>
                <span className="line-clamp-1 text-muted-foreground">
                  {item.productName}
                </span>
              </div>
              <span className="text-xs font-medium shrink-0">
                ${fmt(item.subtotal)}
              </span>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-muted-foreground pl-8">
              +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-xs text-muted-foreground">
            {itemCount} item{itemCount !== 1 ? 's' : ''} ·{' '}
            {order.paymentMethod === 'CASH_ON_DELIVERY' ? '💵 Cash on Delivery' : '💳 Credit Card'}
          </div>
          <div className="text-sm font-bold text-primary">
            ${fmt(order.totalAmount)}
          </div>
        </div>
      </div>
    </Link>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex justify-between pt-2 border-t">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const router              = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: orders = [], isLoading } = useMyOrders();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Sign in to view your orders</h2>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  // Group orders by status
  const activeOrders   = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status));
  const pastOrders     = orders.filter(o =>  ['DELIVERED', 'CANCELLED'].includes(o.status));

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          {!isLoading && (
            <p className="text-muted-foreground text-sm mt-1">
              {orders.length} order{orders.length !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/products">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Shop More
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <OrdersSkeleton />
      ) : orders.length === 0 ? (

        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Package className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1">No orders yet</h2>
            <p className="text-muted-foreground text-sm">
              When you place an order, it will appear here.
            </p>
          </div>
          <Button asChild>
            <Link href="/products">
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

      ) : (
        <div className="space-y-8">

          {/* Active orders */}
          {activeOrders.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Active Orders ({activeOrders.length})
              </h2>
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}

          {/* Past orders */}
          {pastOrders.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Past Orders ({pastOrders.length})
              </h2>
              <div className="space-y-4">
                {pastOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}