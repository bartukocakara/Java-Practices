'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag,
  Store, Settings, ChevronRight, LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/vendor',          icon: LayoutDashboard },
  { label: 'Products',  href: '/vendor/products', icon: Package          },
  { label: 'Orders',    href: '/vendor/orders',   icon: ShoppingBag      },
  { label: 'Store',     href: '/vendor/store',    icon: Store            },
  { label: 'Settings',  href: '/vendor/settings', icon: Settings         },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router              = useRouter();
  const pathname            = usePathname();
  const { isAuthenticated, role, username, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (role !== 'ROLE_VENDOR' && role !== 'ROLE_ADMIN') {
      router.push('/vendor/apply');
    }
  }, [isAuthenticated, role, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-muted/30">

      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-card shrink-0">
        <div className="p-5 border-b">
          <Link href="/vendor" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              V
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Vendor Panel</p>
              <p className="text-xs text-muted-foreground mt-0.5">{username}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== '/vendor' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-1">
          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
              <ChevronRight className="h-4 w-4" />
              Back to Store
            </div>
          </Link>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}