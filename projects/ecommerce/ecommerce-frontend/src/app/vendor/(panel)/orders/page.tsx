'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Search, ChevronLeft, ChevronRight,
  Clock, CheckCircle, Truck, XCircle, Eye,
  DollarSign, TrendingUp, Package, AlertCircle,
} from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Badge }    from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useVendorOrders,
  useVendorOrderStats,
} from '@/lib/hooks/useVendorOrders';

const PAGE_SIZE = 10;

const STATUS_CONFIG: Record<string, {
  label: string; color: string; icon: any;
}> = {
  PENDING:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock        },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',         icon: CheckCircle  },
  SHIPPED:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: Truck        },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',     icon: CheckCircle  },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',             icon: XCircle      },
};

const fmt = (v?: number) => (v ?? 0).toFixed(2);

export default function VendorOrdersPage() {
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage]                 = useState(0);

  const { data: orders = [], isLoading } = useVendorOrders(
    statusFilter !== 'ALL' ? statusFilter : undefined
  );
  const { data: stats } = useVendorOrderStats();

  const filtered = orders.filter(o =>
    String(o.id).includes(search.trim()) ||
    (o.fullName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage   = Math.min(page, Math.max(0, totalPages - 1));
  const paginated  = filtered.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE
  );

  const STAT_CARDS = [
    {
      label: 'Total Revenue',
      value: `$${fmt(stats?.totalRevenue)}`,
      sub:   'All time',
      icon:  DollarSign,
      color: 'text-green-600',
      bg:    'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'This Month',
      value: `$${fmt(stats?.monthRevenue)}`,
      sub:   'Current month',
      icon:  TrendingUp,
      color: 'text-primary',
      bg:    'bg-primary/10',
    },
    {
      label: 'Total Orders',
      value: stats?.total ?? 0,
      sub:   `${stats?.pending ?? 0} pending`,
      icon:  Package,
      color: 'text-blue-600',
      bg:    'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Needs Action',
      value: (stats?.pending ?? 0) + (stats?.confirmed ?? 0),
      sub:   'Pending + confirmed',
      icon:  AlertCircle,
      color: 'text-orange-600',
      bg:    'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage orders containing your products
        </p>
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
            <div>
              <p className="text-xl font-bold leading-none">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-5 gap-2">
        {(['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'] as const)
          .map(s => {
            const conf  = STATUS_CONFIG[s];
            const Icon  = conf.icon;
            const count = stats?.[s.toLowerCase() as keyof typeof stats] ?? 0;
            return (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(statusFilter === s ? 'ALL' : s);
                  setPage(0);
                }}
                className={`rounded-xl border p-3 text-center transition-all hover:shadow-sm ${
                  statusFilter === s
                    ? 'border-primary bg-primary/5'
                    : 'bg-card hover:border-muted-foreground/30'
                }`}
              >
                <Icon className={`h-4 w-4 mx-auto mb-1 ${
                  statusFilter === s ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <p className="text-lg font-bold">{count as number}</p>
                <p className="text-[10px] text-muted-foreground">{conf.label}</p>
              </button>
            );
          })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order # or customer name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={v => { setStatusFilter(v); setPage(0); }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-semibold">No orders found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search
                ? 'Try a different search term'
                : statusFilter !== 'ALL'
                  ? `No ${STATUS_CONFIG[statusFilter]?.label.toLowerCase()} orders`
                  : 'Orders will appear here when customers purchase your products'
              }
            </p>
          </div>
          {statusFilter !== 'ALL' && (
            <Button variant="outline" size="sm"
              onClick={() => setStatusFilter('ALL')}>
              View all orders
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Order</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">Customer</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Date</th>
                  <th className="text-center p-3 font-medium hidden lg:table-cell">Items</th>
                  <th className="text-right p-3 font-medium">Amount</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-center p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginated.map(order => {
                  const config     = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                  const StatusIcon = config.icon;
                  return (
                    <tr key={order.id}
                      className="hover:bg-muted/30 transition-colors">

                      {/* Order */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                            <ShoppingBag className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">#{order.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.paymentMethod === 'CASH_ON_DELIVERY'
                                ? 'COD' : 'Card'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-3 hidden sm:table-cell">
                        <p className="font-medium">{order.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.city}, {order.country}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>

                      {/* Items count */}
                      <td className="p-3 text-center hidden lg:table-cell">
                        <span className="text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-3 text-right">
                        <span className="font-bold text-primary">
                          ${fmt(order.totalAmount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <Badge
                          className={`${config.color} border-0 text-xs inline-flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </td>

                      {/* View */}
                      <td className="p-3 text-center">
                        <Button variant="ghost" size="sm"
                          className="h-8 w-8 p-0" asChild>
                          <Link href={`/vendor/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
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
                Showing {safePage * PAGE_SIZE + 1}–{Math.min(
                  (safePage + 1) * PAGE_SIZE, filtered.length
                )} of {filtered.length} orders
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm"
                  disabled={safePage === 0}
                  onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const show     = i === 0 || i === totalPages - 1 || Math.abs(i - safePage) <= 1;
                    const ellipsis = !show && (i === 1 || i === totalPages - 2);
                    if (ellipsis) return (
                      <span key={i} className="px-1 text-muted-foreground text-sm">…</span>
                    );
                    if (!show) return null;
                    return (
                      <Button key={i}
                        variant={safePage === i ? 'default' : 'outline'}
                        size="sm" className="w-9 h-9"
                        onClick={() => setPage(i)}>
                        {i + 1}
                      </Button>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}