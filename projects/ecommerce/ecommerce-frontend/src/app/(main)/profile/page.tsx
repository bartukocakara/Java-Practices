'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, Mail, Lock, Package, MapPin,
  ShoppingBag, Star, Eye, EyeOff,
  Loader2, CheckCircle, LogOut, ChevronRight
} from 'lucide-react';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { Label }     from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge }     from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore }  from '@/store/authStore';
import { useMyOrders }   from '@/lib/hooks/useOrders';
import { useAddresses }  from '@/lib/hooks/useAddresses';
import { useCart }       from '@/lib/hooks/useCart';
import { authApi }       from '@/lib/api/auth';
import { toast } from 'sonner';

// ── Password change schema ──
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  SHIPPED:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export default function ProfilePage() {
  const router  = useRouter();
  const { username, role, logout, isAuthenticated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  
  const { data: orders    = [] } = useMyOrders();
  const { data: addresses = [] } = useAddresses();
  const { data: cart }           = useCart();

  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [changingPw, setChangingPw]     = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    // your redirect logic here
  }, [hydrated, isAuthenticated]);

  if (!hydrated) return null;
  const newPassword = watch('newPassword', '');
  const strength = [
    newPassword.length >= 8,
    /[A-Z]/.test(newPassword),
    /[0-9]/.test(newPassword),
    /[^a-zA-Z0-9]/.test(newPassword),
  ].filter(Boolean).length;

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = [
    '',
    'bg-destructive',
    'bg-orange-400',
    'bg-yellow-400',
    'bg-green-500',
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
    toast.success('Logged out successfully');
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setChangingPw(true);
    try {
      // Re-login to verify current password
      await authApi.login(username!, data.currentPassword);
      // TODO: call change password endpoint when added to backend
      toast.success('Password changed successfully');
      reset();
    } catch {
      toast.error('Current password is incorrect');
    } finally {
      setChangingPw(false);
    }
  };

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const activeOrders    = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status));
  const recentOrders    = orders.slice(0, 3);
  const cartCount       = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const defaultAddress  = addresses.find(a => a.isDefault);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">

      {/* ── Profile Header ── */}
      <div className="rounded-2xl border bg-card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{username}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={role === 'ROLE_ADMIN' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {role === 'ROLE_ADMIN' ? '⚡ Admin' : '👤 Member'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {orders.length} order{orders.length !== 1 ? 's' : ''} placed
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive hover:border-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          {[
            { label: 'Total Orders',    value: orders.length,         icon: Package,  href: '/profile/orders' },
            { label: 'Active Orders',   value: activeOrders.length,   icon: ShoppingBag, href: '/profile/orders' },
            { label: 'Cart Items',      value: cartCount,             icon: Star,     href: '/cart' },
            { label: 'Saved Addresses', value: addresses.length,      icon: MapPin,   href: '/profile/addresses' },
          ].map(stat => (
            <Link key={stat.label} href={stat.href} className="group">
              <div className="flex flex-col items-center p-3 rounded-xl bg-muted/50 hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all">
                <stat.icon className="h-5 w-5 text-primary mb-1" />
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground text-center leading-tight mt-0.5">
                  {stat.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Orders */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Recent Orders
              </h2>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/profile/orders">
                  View all <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No orders yet</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => {
                  const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                  const fmt    = (v: number) => (v ?? 0).toFixed(2);
                  return (
                    <Link key={order.id} href={`/profile/orders/${order.id}`}>
                      <div className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium">Order #{order.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                              })}
                              {' · '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={`${config.color} border-0 text-xs`}>
                            {config.label}
                          </Badge>
                          <span className="text-sm font-semibold text-primary hidden sm:block">
                            ${fmt(order.totalAmount)}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Lock className="h-4 w-4 text-primary" />
              Change Password
            </h2>

            <form onSubmit={handleSubmit(onPasswordSubmit)} noValidate className="space-y-4">

              {/* Current Password */}
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-sm">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Enter current password"
                    {...register('currentPassword')}
                    className={`pr-10 ${errors.currentPassword ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    placeholder="Enter new password"
                    {...register('newPassword')}
                    className={`pr-10 ${errors.newPassword ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                )}
                {/* Strength indicator */}
                {newPassword.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= strength ? strengthColor[strength] : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Strength:{' '}
                      <span className="font-medium">{strengthLabel[strength]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    {...register('confirmPassword')}
                    className={`pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={changingPw} className="w-full sm:w-auto">
                {changingPw
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                  : <><CheckCircle className="mr-2 h-4 w-4" /> Update Password</>
                }
              </Button>
            </form>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Account Info */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-primary" />
              Account Info
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p className="text-sm font-medium">{username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-medium">
                    {role === 'ROLE_ADMIN' ? 'Administrator' : 'Customer'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Default Address */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Default Address
              </h2>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/profile/addresses">
                  Manage <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>

            {defaultAddress ? (
              <div className="text-sm space-y-1 text-muted-foreground">
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  {defaultAddress.title}
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">Default</Badge>
                </p>
                <p>{defaultAddress.fullName}</p>
                <p>{defaultAddress.phone}</p>
                <p>{defaultAddress.addressLine}</p>
                <p>{defaultAddress.city}, {defaultAddress.country}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground mb-2">No saved addresses</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile/addresses">Add Address</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
              Quick Links
            </h2>
            <div className="space-y-1">
              {[
                { label: 'My Orders',    href: '/profile/orders',    icon: Package },
                { label: 'My Addresses', href: '/profile/addresses', icon: MapPin },
                { label: 'Shopping Cart',href: '/cart',              icon: ShoppingBag },
                { label: 'All Products', href: '/products',          icon: Star },
                ...(role === 'ROLE_ADMIN'
                  ? [{ label: 'Admin Panel', href: '/admin', icon: Lock }]
                  : []),
              ].map(link => (
                <Link key={link.href} href={link.href}>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors group">
                    <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm">{link.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}