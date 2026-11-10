'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Bell, User, LogOut, LayoutDashboard, Heart, Shield } from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { cn } from '@/lib/utils';
import { SITE_NAME } from '@/lib/constants';
import type { User as UserType } from '@/types';

interface NavProps {
  session: { auth: { id: string }; profile: UserType } | null;
  unreadCount: number;
}

export function Nav({ session, unreadCount }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const isSeller = session?.profile?.role === 'seller' || session?.profile?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label={`${SITE_NAME} home`} className="flex items-center">
            <Image src="/logo.svg" alt={SITE_NAME} width={140} height={32} priority className="h-8 w-auto" />
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link href="/" className={cn('text-sm font-medium transition hover:text-foreground', pathname === '/' ? 'text-foreground' : 'text-muted-foreground')}>Marketplace</Link>
            <Link href="/verified-sellers" className={cn('text-sm font-medium transition hover:text-foreground', pathname === '/verified-sellers' ? 'text-foreground' : 'text-muted-foreground')}>Verified sellers</Link>
            {isSeller && (
              <Link href="/dashboard" className={cn('text-sm font-medium transition hover:text-foreground', pathname.startsWith('/dashboard') ? 'text-foreground' : 'text-muted-foreground')}>Dashboard</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {!session && (
            <>
              <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-medium hover:bg-muted sm:block">Sign in</Link>
              <Link href="/signup" className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">Sell on {SITE_NAME}</Link>
            </>
          )}
          {session && (
            <>
              <Link href="/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold" aria-label="Account menu">
                  {session.profile.name?.charAt(0).toUpperCase() || 'U'}
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-border bg-background p-2 shadow-lg">
                      <div className="border-b border-border px-3 py-2">
                        <p className="text-sm font-medium">{session.profile.name}</p>
                        <p className="text-xs text-muted-foreground">{session.profile.email}</p>
                      </div>
                      <Link href="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}><User className="h-4 w-4" /> My account</Link>
                      <Link href="/favorites" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}><Heart className="h-4 w-4" /> Saved</Link>
                      {isSeller && (
                        <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                      )}
                      {session.profile.role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}><Shield className="h-4 w-4" /> Admin</Link>
                      )}
                      <button onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-muted"><LogOut className="h-4 w-4" /> Sign out</button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-border md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Marketplace</Link>
            <Link href="/verified-sellers" className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Verified sellers</Link>
            {isSeller && <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Dashboard</Link>}
            {!session && (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Sign in</Link>
                <Link href="/signup" className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Create account</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Image src="/logo.svg" alt={SITE_NAME} width={120} height={28} className="h-7 w-auto" />
            <p className="mt-3 text-sm text-muted-foreground">Buy and sell on WhatsApp across Nigeria and beyond.</p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">Browse listings</Link></li>
              <li><Link href="/verified-sellers" className="hover:text-foreground">Verified sellers</Link></li>
              <li><Link href="/signup" className="hover:text-foreground">Sell on {SITE_NAME}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About</Link></li>
              <li><Link href="/about#contact" className="hover:text-foreground">Contact</Link></li>
              <li><Link href="/about#faq" className="hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p>Deals happen on WhatsApp. PrimeMart does not mediate disputes or hold funds.</p>
        </div>
      </div>
    </footer>
  );
}