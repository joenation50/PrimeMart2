'use client';

import { usePathname } from 'next/navigation';
import { Nav, Footer } from '@/features/shared/nav';

export function GlobalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide nav for admin, listing pages, and store profile pages
  const isAdminRoute = pathname?.startsWith('/admin');
  const isListingRoute = pathname?.startsWith('/listing/');
  const isStoreRoute = pathname?.startsWith('/store/');

  if (isAdminRoute || isListingRoute || isStoreRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1 pb-28 md:pb-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}