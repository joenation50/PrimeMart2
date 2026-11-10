// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { baseMetadata } from '@/lib/seo';
import { Nav, Footer } from '@/features/shared/nav';
import { getSession } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = baseMetadata();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  // Unread notifications count for the header bell
  let unreadCount = 0;
  if (session) {
    const supabase = await createServerSupabase();
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.profile.id)
      .is('read_at', null);
    unreadCount = count ?? 0;
  }
  
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Suspense fallback={null}>
          <Nav session={session} unreadCount={unreadCount} />
        </Suspense>
        <main className="min-h-[calc(100vh-200px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}