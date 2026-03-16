'use client';

import Link from 'next/link';
import {
  TrendingUp, Package, ShoppingBag, AlertTriangle,
  DollarSign, Percent, ArrowRight, Clock, CheckCircle,
  Truck, XCircle
} from 'lucide-react';
import { Button }    from '@/components/ui/button';
import { Badge }     from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton }  from '@/components/ui/skeleton';
import { useVendorDashboard } from '@/lib/hooks/useVendor';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800',     icon: CheckCircle },
  SHIPPED:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800',   icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800',       icon: XCircle },
};

const fmt = (val: number | undefined | null) => (val ?? 0).toFixed(2);

export default function VendorDashboardPage() {
  const { data: dashboard, isLoading } = useVendorDashboard();

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );

  if (!dashboard) return null;

  const STATS = [
    {
      label: 'Total Revenue',
      value: `$${fmt(dashboard.totalRevenue)}`,
      sub:   'All time',
      icon:  DollarSign,
      color: 'text-green-600',
      bg:    'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'This Month',
      value: `$${fmt(dashboard.monthRevenue)}`,
      sub:   'Current month',
      icon:  TrendingUp,
      color: 'text-blue-600',
      bg:    'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Net Earnings',
      value: `$${fmt(dashboard.netEarnings)}`,
      sub:   `After ${dashboard.commissionRate}% commission`,
      icon:  Percent,
      color: 'text-primary',
      bg:    'bg-primary/10',
    },
    {
      label: 'Total Orders',
      value: dashboard.totalOrders,
      sub:   `${dashboard.pendingOrders} pending`,
      icon:  ShoppingBag,
      color: 'text-purple-600',
      bg:    'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Total Products',
      value: dashboard.totalProducts,
      sub:   `${dashboard.activeProducts} active`,
      icon:  Package,
      color: 'text-orange-600',
      bg:    'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      label: 'Low Stock',
      value: dashboard.lowStockProducts,
      sub:   '≤5 units remaining',
      icon:  AlertTriangle,
      color: dashboard.lowStockProducts > 0 ? 'text-destructive' : 'text-muted-foreground',
      bg:    dashboard.lowStockProducts > 0
        ? 'bg-destructive/10'
        : 'bg-muted',
    },
    {
      label: 'Commission',
      value: `$${fmt(dashboard.totalCommission)}`,
      sub:   `${dashboard.commissionRate}% platform fee`,
      icon:  Percent,
      color: 'text-muted-foreground',
      bg:    'bg-muted',
    },
    {
      label: 'Store Status',
      value: dashboard.status,
      sub:   dashboard.storeSlug,
      icon:  CheckCircle,
      color: dashboard.status === 'ACTIVE' ? 'text-green-600' : 'text-muted-foreground',
      bg:    dashboard.status === 'ACTIVE'
        ? 'bg-green-100 dark:bg-green-900/30'
        : 'bg-muted',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{dashboard.storeName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vendor Dashboard · /{dashboard.storeSlug}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/vendor/products">
              <Package className="h-4 w-4 mr-2" />
              Manage Products
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/vendor/orders">
              <ShoppingBag className="h-4 w-4 mr-2" />
              View Orders
            </Link>
          </Button>
        </div>
      </div>

      {/* Low stock warning */}
      {dashboard.lowStockProducts > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">
              {dashboard.lowStockProducts} product{dashboard.lowStockProducts !== 1 ? 's' : ''} running low on stock
            </p>
            <p className="text-xs text-destructive/80">
              Update stock levels to avoid missing orders
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0">
            <Link href="/vendor/products?filter=low-stock">View</Link>
          </Button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(stat => (
          <div key={stat.label} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Orders</h2>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/vendor/orders">
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>

        {dashboard.recentOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {dashboard.recentOrders.map(order => {
              const config     = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
              const StatusIcon = config.icon;
              return (
                <Link key={order.id} href={`/vendor/orders/${order.id}`}>
                  <div className="flex items-center justify-between gap-3 py-3 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Order #{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`${config.color} border-0 text-xs flex items-center gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                      <span className="text-sm font-semibold text-primary hidden sm:block">
                        ${fmt(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Earnings breakdown */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold mb-4">Earnings Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: 'Gross Revenue',  value: fmt(dashboard.totalRevenue),   color: 'text-foreground' },
            { label: `Platform Commission (${dashboard.commissionRate}%)`,
                                       value: `- $${fmt(dashboard.totalCommission)}`, color: 'text-destructive' },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className={`text-sm font-medium ${row.color}`}>${row.value}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold">Net Earnings</span>
            <span className="font-bold text-primary text-lg">
              ${fmt(dashboard.netEarnings)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}