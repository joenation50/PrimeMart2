'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  Menu, X, Bell, User, LogOut, LayoutDashboard, Heart, Shield, 
  Sun, Moon, Home, Store, Search, MoreHorizontal, Settings, 
  ChevronRight, HelpCircle
} from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false); // For mobile "More" menu

  useEffect(() => setMounted(true), []);

  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const isSeller = session?.profile?.role === 'seller' || session?.profile?.role === 'admin';
  const isBuyer = session?.profile?.role === 'buyer';
  const isAdmin = session?.profile?.role === 'admin';

  const homeHref = isSeller ? '/dashboard' : isBuyer ? '/buyer' : '/';

  return (
    <>
      {/* TOP NAVBAR (Desktop) */}
      <header className="sticky top-0 z-50 w-full glass-nav hidden md:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image src="/logo-black.png" alt={SITE_NAME} width={140} height={35} priority className="h-8 w-auto object-contain block dark:hidden" />
              <Image src="/logo-white.png" alt={SITE_NAME} width={140} height={35} priority className="h-8 w-auto object-contain hidden dark:block" />
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link href="/marketplace" className={cn('text-sm font-medium transition', pathname === '/marketplace' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>Marketplace</Link>
              <Link href="/verified-sellers" className={cn('text-sm font-medium transition', pathname === '/verified-sellers' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>Verified Sellers</Link>
              {isSeller && <Link href="/dashboard" className={cn('text-sm font-medium transition', pathname.startsWith('/dashboard') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>Dashboard</Link>}
              {isBuyer && <Link href="/buyer" className={cn('text-sm font-medium transition', pathname.startsWith('/buyer') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>My Hub</Link>}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {mounted && (
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/50 transition hover:bg-secondary">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            {!session && (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</Link>
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
                <button onClick={signOut} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE TOP HEADER (Minimal) */}
      <header className="sticky top-0 z-40 w-full glass-nav md:hidden flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo-black.png" alt={SITE_NAME} width={100} height={25} className="h-6 w-auto block dark:hidden" />
          <Image src="/logo-white.png" alt={SITE_NAME} width={100} height={25} className="h-6 w-auto hidden dark:block" />
        </Link>
        <div className="flex items-center gap-2">
          {!session ? (
            <Link href="/signup" className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground">Get Started</Link>
          ) : (
            <Link href="/account" className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
              {session.profile.name.charAt(0)}
            </Link>
          )}
        </div>
      </header>

      {/* FLOATING LIQUID GLASS DOCK (Mobile Only) */}
      <div className="floating-dock md:hidden">
        <Link href="/marketplace" className={cn("dock-item", pathname === '/marketplace' && "active")}>
          <Search />
          <span>Browse</span>
        </Link>

        <Link href={homeHref} className={cn("dock-item", pathname === homeHref && "active")}>
          {isSeller ? <LayoutDashboard /> : <Home />}
          <span>{isSeller ? 'Dash' : 'Home'}</span>
        </Link>

        {session && (
          <Link href="/favorites" className={cn("dock-item", pathname === '/favorites' && "active")}>
            <Heart />
            <span>Saved</span>
          </Link>
        )}

        {/* The "More" Button */}
        <button onClick={() => setMenuOpen(true)} className={cn("dock-item", menuOpen && "active")}>
          <MoreHorizontal />
          <span>More</span>
        </button>
      </div>

      {/* MOBILE "MORE" MENU (Bottom Sheet) */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMenuOpen(false)}>
          <div 
            className="w-full max-w-md rounded-t-3xl bg-background border-t border-border p-6 pb-24 animate-slide-up-menu glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-border" />
            
            <div className="space-y-2">
              {session ? (
                <>
                  <Link href="/notifications" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Notifications</span>
                    </div>
                    {unreadCount > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{unreadCount}</span>}
                  </Link>

                  <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">My Profile</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>

                  {isBuyer && (
                    <Link href="/signup?intent=sell" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary text-primary">
                      <div className="flex items-center gap-3">
                        <Store className="h-5 w-5" />
                        <span className="font-medium">Start Selling</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}

                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Admin Panel</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  )}

                  <div className="my-2 h-px bg-border" />

                  {mounted && (
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex w-full items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                      <div className="flex items-center gap-3">
                        {theme === 'dark' ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
                        <span className="font-medium">Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                      </div>
                    </button>
                  )}

                  <button onClick={signOut} className="flex w-full items-center justify-between rounded-xl px-4 py-3 hover:bg-red-500/10 text-red-500">
                    <div className="flex items-center gap-3">
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Sign Out</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-foreground">Join PrimeMart</h2>
                    <p className="text-sm text-muted-foreground">Sign in to access your dashboard.</p>
                  </div>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex w-full items-center justify-center rounded-xl border border-border py-3 font-medium hover:bg-secondary">
                    Sign In
                  </Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="flex w-full items-center justify-center rounded-xl bg-primary py-3 font-medium text-primary-foreground">
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border py-12 bg-background pb-32 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Link href="/" className="flex items-center">
          <Image src="/logo-black.png" alt={SITE_NAME} width={100} height={25} className="h-6 w-auto opacity-70 block dark:hidden" />
          <Image src="/logo-white.png" alt={SITE_NAME} width={100} height={25} className="h-6 w-auto opacity-70 hidden dark:block" />
        </Link>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {SITE_NAME}. Built by PrimeWeb Designs.</p>
      </div>
    </footer>
  );
}