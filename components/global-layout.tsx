'use client';

import { usePathname } from 'next/navigation';
import { Nav, Footer } from '@/features/shared/nav';

export function GlobalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // If we are in the admin panel, don't show the consumer marketplace nav/footer
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}