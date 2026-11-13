'use client';

import { usePathname } from 'next/navigation';
import { Nav, Footer } from '@/features/shared/nav';

export function GlobalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // 1. Hide nav for Admin routes
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // 2. Hide nav for single Listing pages
  const isListingRoute = pathname?.startsWith('/listing/');

  // If it's admin or a listing page, strip the Nav and Footer entirely
  if (isAdminRoute || isListingRoute) {
    return <>{children}</>;
  }

  // Otherwise, show the normal layout
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