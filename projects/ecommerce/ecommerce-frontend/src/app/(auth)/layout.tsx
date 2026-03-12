import { Package } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8">
        <Package className="h-6 w-6 text-primary" />
        Marketplace
      </Link>
      {children}
    </div>
  );
}