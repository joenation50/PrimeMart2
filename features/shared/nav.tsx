'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  X, Bell, User, LogOut, LayoutDashboard, Heart, Shield, 
  Sun, Moon, Home, Store, Search, MoreHorizontal, 
  ChevronRight, PlusCircle, Sparkles, FileText, AlertTriangle, Settings, BarChart
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => setMounted(true), []);

  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const role = session?.profile?.role;
  const isAdmin = role === 'admin';
  const isSeller = role === 'seller' || isAdmin;
  const isBuyer = role === 'buyer';

  const homeHref = isSeller ? '/dashboard' : isBuyer ? '/buyer' : '/';

  function handleBrowseClick(e: React.MouseEvent) {
    if (!session) {
      e.preventDefault();
      setShowAuthPrompt(true);
    }
  }

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

      {/* MOBILE TOP HEADER */}
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

      {/* FLOATING LIQUID GLASS DOCK */}
      <div className="floating-dock md:hidden">
        <Link href="/marketplace" onClick={handleBrowseClick} className={cn("dock-item", pathname === '/marketplace' && "active")}>
          <Search />
          <span>Browse</span>
        </Link>

        <Link href={homeHref} className={cn("dock-item", pathname === homeHref && "active")}>
          {isSeller ? <LayoutDashboard /> : <Home />}
          <span>{isSeller ? 'Dash' : 'Home'}</span>
        </Link>

        {session ? (
          <Link href="/notifications" className={cn("dock-item relative", pathname === '/notifications' && "active")}>
            <Bell />
            <span>Alerts</span>
            {unreadCount > 0 && <span className="absolute top-1 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />}
          </Link>
        ) : (
          <Link href="/login" className={cn("dock-item", pathname === '/login' && "active")}>
            <User />
            <span>Log in</span>
          </Link>
        )}

        {isSeller ? (
          <Link href="/listings/new" className={cn("dock-item", pathname === '/listings/new' && "active")}>
            <PlusCircle />
            <span>Add</span>
          </Link>
        ) : (
          <Link href="/favorites" className={cn("dock-item", pathname === '/favorites' && "active")}>
            <Heart />
            <span>Saved</span>
          </Link>
        )}

        <button onClick={() => setMenuOpen(true)} className={cn("dock-item", menuOpen && "active")}>
          <MoreHorizontal />
          <span>More</span>
        </button>
      </div>

      {/* AUTH PROMPT OVERLAY */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 md:hidden" onClick={() => setShowAuthPrompt(false)}>
          <div className="w-full max-w-sm rounded-3xl glass-card p-8 text-center animate-slide-up-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Unlock the Marketplace</h2>
            <p className="text-sm text-muted-foreground mb-8">Sign up to browse all fantastic products at PrimeMart and connect with verified sellers.</p>
            <Link href="/signup" className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/20 mb-3">
              Create Free Account
            </Link>
            <button onClick={() => setShowAuthPrompt(false)} className="w-full rounded-xl py-3 text-sm font-medium text-muted-foreground hover:bg-secondary">
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* MOBILE "MORE" MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMenuOpen(false)}>
          <div 
            className="w-full max-w-md rounded-t-3xl bg-background border-t border-border p-6 pb-24 animate-slide-up-menu glass-card overflow-y-auto max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-border" />
            
            <div className="space-y-1">
              {session ? (
                <>
                  <div className="px-4 pb-2">
                    <p className="text-sm font-semibold text-foreground">{session.profile.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{role}</p>
                  </div>

                  <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                    <div className="flex items-center gap-3"><User className="h-5 w-5 text-muted-foreground" /><span className="font-medium">My Profile</span></div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <Link href="/verified-sellers" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                    <div className="flex items-center gap-3"><Shield className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Verified Sellers</span></div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  
                  {isBuyer && (
                    <>
                      <Link href="/favorites" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                        <div className="flex items-center gap-3"><Heart className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Saved Items</span></div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                      <Link href="/signup?intent=sell" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 text-primary hover:bg-primary/10">
                        <div className="flex items-center gap-3"><Store className="h-5 w-5" /><span className="font-medium">Start Selling</span></div>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </>
                  )}

                  {isSeller && !isAdmin && (
                    <>
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                        <div className="flex items-center gap-3"><LayoutDashboard className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Dashboard</span></div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                      <Link href="/dashboard/analytics" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                        <div className="flex items-center gap-3"><BarChart className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Analytics</span></div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                      <Link href="/listings/new" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                        <div className="flex items-center gap-3"><PlusCircle className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Create Listing</span></div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                      <Link href="/dashboard/settings" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                        <div className="flex items-center gap-3"><Settings className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Store Settings</span></div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <div className="my-2 h-px bg-border" />
                      <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin Controls</p>
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                        <div className="flex items-center gap-3"><LayoutDashboard className="h-5 w-5 text-primary" /><span className="font-medium text-primary">Approval Queue</span></div>
                      </Link>
                      <Link href="/admin/users" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                        <div className="flex items-center gap-3"><User className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Manage Users</span></div>
                      </Link>
                      <Link href="/admin/moderation" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                        <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Moderation</span></div>
                      </Link>
                      <Link href="/admin/content" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                        <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Content & Categories</span></div>
                      </Link>
                      <Link href="/admin/system" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                        <div className="flex items-center gap-3"><Settings className="h-5 w-5 text-muted-foreground" /><span className="font-medium">System & Banners</span></div>
                      </Link>
                    </>
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
                    <div className="flex items-center gap-3"><LogOut className="h-5 w-5" /><span className="font-medium">Sign Out</span></div>
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-6 text-center pt-4">
                    <h2 className="text-2xl font-bold text-foreground">Join PrimeMart</h2>
                    <p className="text-sm text-muted-foreground">Sign in to access your dashboard.</p>
                  </div>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex w-full items-center justify-center rounded-xl border border-border py-3 font-medium hover:bg-secondary">
                    Sign In
                  </Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="mt-2 flex w-full items-center justify-center rounded-xl bg-primary py-3 font-medium text-primary-foreground">
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