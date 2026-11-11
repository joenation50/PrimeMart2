'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Menu, X, Bell, User, LogOut, LayoutDashboard, Heart, Shield, Sun, Moon } from 'lucide-react';
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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const isSeller = session?.profile?.role === 'seller' || session?.profile?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 w-full glass-nav">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo-black.png" 
              alt={SITE_NAME} 
              width={140} 
              height={35} 
              priority 
              className="h-8 w-auto object-contain block dark:hidden" 
            />
            <Image 
              src="/logo-white.png" 
              alt={SITE_NAME} 
              width={140} 
              height={35} 
              priority 
              className="h-8 w-auto object-contain hidden dark:block" 
            />
          </Link>
          
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className={cn('text-sm font-medium transition', pathname === '/' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>Marketplace</Link>
            <Link href="/verified-sellers" className={cn('text-sm font-medium transition', pathname === '/verified-sellers' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>Verified Sellers</Link>
            {isSeller && (
              <Link href="/dashboard" className={cn('text-sm font-medium transition', pathname.startsWith('/dashboard') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>Dashboard</Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/50 transition hover:bg-secondary"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {!session && (
            <>
              <Link href="/login" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block">Sign in</Link>
              <Link href="/signup" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">Get Started</Link>
            </>
          )}

          {session && (
            <>
              <Link href="/notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{unreadCount}</span>}
              </Link>
              <Link href="/account" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold hover:opacity-80">
                {session.profile.name.charAt(0)}
              </Link>
              <button onClick={signOut} className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}

          <button className="flex h-9 w-9 items-center justify-center rounded-full md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-1 p-4">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm hover:bg-secondary">Marketplace</Link>
            <Link href="/verified-sellers" className="rounded-lg px-3 py-2 text-sm hover:bg-secondary">Verified Sellers</Link>
            {isSeller && <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm hover:bg-secondary">Dashboard</Link>}
            {!session && (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-sm hover:bg-secondary">Sign in</Link>
                <Link href="/signup" className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">Get Started</Link>
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
    <footer className="border-t border-border py-12 bg-background">
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo-black.png" 
            alt={SITE_NAME} 
            width={100} 
            height={25} 
            className="h-6 w-auto opacity-70 block dark:hidden" 
          />
          <Image 
            src="/logo-white.png" 
            alt={SITE_NAME} 
            width={100} 
            height={25} 
            className="h-6 w-auto opacity-70 hidden dark:block" 
          />
        </Link>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {SITE_NAME}. Built by PrimeWeb Designs.</p>
      </div>
    </footer>
  );
}