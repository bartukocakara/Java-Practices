'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag,
  Store, Settings, ChevronRight, LogOut,
  Bell, ExternalLink
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/vendor',          icon: LayoutDashboard },
  { label: 'Products',  href: '/vendor/products', icon: Package          },
  { label: 'Orders',    href: '/vendor/orders',   icon: ShoppingBag      },
  { label: 'Store',     href: '/vendor/store',    icon: Store            },
  { label: 'Settings',  href: '/vendor/settings', icon: Settings         },
];

export default function VendorPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isVendor, isAdmin, username, role, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isVendor && !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isVendor, isAdmin, router]);

  if (!isAuthenticated || (!isVendor && !isAdmin)) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-muted/30">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-card shrink-0 fixed top-0 left-0 h-full z-40">

        {/* Store header */}
        <div className="p-4 border-b">
          <Link href="/vendor" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shrink-0">
              {username?.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-none truncate">
                Vendor Panel
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {username}
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Management
          </p>
          {NAV_ITEMS.map(item => {
            const isActive =
              item.href === '/vendor'
                ? pathname === '/vendor'
                : pathname.startsWith(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}

          {/* Admin shortcut */}
          {isAdmin && (
            <>
              <Separator className="my-2" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                Admin
              </p>
              <Link href="/admin">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                  <Settings className="h-4 w-4 shrink-0" />
                  Admin Panel
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t space-y-0.5">
          <Link href="/" target="_blank">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <ExternalLink className="h-4 w-4 shrink-0" />
              View Store
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col md:ml-60">

        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card/95 backdrop-blur px-6">

          {/* Mobile: store name */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
              {username?.slice(0, 1).toUpperCase()}
            </div>
            <span className="text-sm font-semibold">Vendor Panel</span>
          </div>

          {/* Breadcrumb — desktop */}
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/vendor" className="hover:text-foreground transition-colors">
              Vendor
            </Link>
            {pathname !== '/vendor' && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-medium capitalize">
                  {pathname.split('/').pop()}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />

            {/* Role badge */}
            <Badge
              variant={isAdmin ? 'default' : 'secondary'}
              className="text-xs hidden sm:flex"
            >
              {isAdmin ? '⚡ Admin' : '🏪 Vendor'}
            </Badge>

            {/* Avatar */}
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                {username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t bg-card">
        {NAV_ITEMS.map(item => {
          const isActive =
            item.href === '/vendor'
              ? pathname === '/vendor'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}