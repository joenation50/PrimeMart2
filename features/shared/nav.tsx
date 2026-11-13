'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  Bell, User, LogOut, LayoutDashboard, Heart, Shield, 
  Sun, Moon, Home, Search, MoreHorizontal, 
  ChevronRight, PlusCircle, Sparkles, BarChart, Settings
} from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { cn } from '@/lib/utils';
import { SITE_NAME } from '@/lib/constants';

export function Nav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const supabase = createBrowserSupabase();

    async function getSessionAndProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        const { data } = await supabase.from('users').select('role, seller_status').eq('id', session.user.id).single();
        setProfile(data);
      }
      setLoading(false);
    }
    
    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const { data } = await supabase.from('users').select('role, seller_status').eq('id', session.user.id).single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  const isAdmin = profile?.role === 'admin';
  const isSeller = profile?.role === 'seller' || isAdmin;
  const isBuyer = profile?.role === 'buyer';

  const sellerIsUnpaid = isSeller && (profile?.seller_status === 'unpaid' || profile?.seller_status === 'pending');
  
  const homeHref = isSeller ? (sellerIsUnpaid ? '/seller/paywall' : '/seller') : '/buyer';

  function handleBrowseClick(e: React.MouseEvent) {
    if (!session) {
      e.preventDefault();
      setShowAuthPrompt(true);
    }
  }

  if (loading) return null;

  return (
    <>
      {/* DESKTOP NAV */}
      <header className="sticky top-0 z-50 w-full glass-nav hidden md:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image src="/logo-black.png" alt={SITE_NAME} width={140} height={35} priority className="h-8 w-auto object-contain block dark:hidden" />
              <Image src="/logo-white.png" alt={SITE_NAME} width={140} height={35} priority className="h-8 w-auto object-contain hidden dark:block" />
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link href="/marketplace" className={cn('text-sm font-medium transition', pathname === '/marketplace' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>Marketplace</Link>
              
              {isAdmin && (
                <Link href="/admin" className={cn('flex items-center gap-1.5 text-sm font-bold text-primary transition hover:text-primary/80', pathname.startsWith('/admin') && 'underline decoration-2 underline-offset-4')}>
                  <Shield className="h-4 w-4" /> Admin Panel
                </Link>
              )}

              {isSeller && !sellerIsUnpaid && <Link href="/seller" className={cn('text-sm font-medium transition', pathname.startsWith('/seller') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>Seller Dashboard</Link>}
              {isSeller && sellerIsUnpaid && <Link href="/seller/paywall" className={cn('text-sm font-medium transition', pathname.startsWith('/seller/paywall') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>Activate Account</Link>}
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
                <Link href={isSeller ? "/seller/notifications" : "/buyer/notifications"} className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary">
                  <Bell className="h-4 w-4" />
                </Link>
                <Link href={isSeller ? "/seller/account" : "/buyer/account"} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold hover:opacity-80">
                  {session.user.email?.charAt(0).toUpperCase()}
                </Link>
                <button onClick={signOut} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-40 w-full glass-nav md:hidden flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo-black.png" alt={SITE_NAME} width={100} height={25} className="h-6 w-auto block dark:hidden" />
          <Image src="/logo-white.png" alt={SITE_NAME} width={100} height={25} className="h-6 w-auto hidden dark:block" />
        </Link>
        <div className="flex items-center gap-2">
          {!session ? (
            <Link href="/signup" className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground">Get Started</Link>
          ) : (
            <Link href={isSeller ? "/seller/account" : "/buyer/account"} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
              {session.user.email?.charAt(0).toUpperCase()}
            </Link>
          )}
        </div>
      </header>

      {/* MOBILE DOCK - REWRITTEN WITH PURE TAILWIND TO FIX GLOW BUG */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe md:hidden">
        <nav className="relative mx-auto flex max-w-md items-center justify-between overflow-hidden rounded-full border border-border/50 bg-background/80 px-2 py-3 shadow-2xl backdrop-blur-xl">
          {/* The Green Glow - safely contained by overflow-hidden */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />

          <Link href="/marketplace" onClick={handleBrowseClick} className={cn("relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors", pathname === '/marketplace' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Search className="h-6 w-6" />
            <span className="text-[10px] font-medium">Browse</span>
            {pathname === '/marketplace' && <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />}
          </Link>

          <Link href={session ? homeHref : '/'} className={cn("relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors", pathname === homeHref ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            {isSeller ? <LayoutDashboard className="h-6 w-6" /> : <Home className="h-6 w-6" />}
            <span className="text-[10px] font-medium">{isSeller ? (sellerIsUnpaid ? 'Pay' : 'Seller') : 'Buyer'}</span>
            {pathname === homeHref && <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />}
          </Link>

          {session ? (
            <Link href={isSeller ? "/seller/notifications" : "/buyer/notifications"} className={cn("relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors", pathname.includes('/notifications') ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <Bell className="h-6 w-6" />
              <span className="text-[10px] font-medium">Alerts</span>
              {pathname.includes('/notifications') && <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />}
            </Link>
          ) : (
            <Link href="/login" className={cn("relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors", pathname === '/login' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <User className="h-6 w-6" />
              <span className="text-[10px] font-medium">Log in</span>
              {pathname === '/login' && <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />}
            </Link>
          )}

          {isSeller && !sellerIsUnpaid ? (
            <Link href="/seller/listings/new" className={cn("relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors", pathname === '/seller/listings/new' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <PlusCircle className="h-6 w-6" />
              <span className="text-[10px] font-medium">Add</span>
              {pathname === '/seller/listings/new' && <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />}
            </Link>
          ) : (
            <Link href="/buyer/favorites" className={cn("relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors", pathname === '/buyer/favorites' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <Heart className="h-6 w-6" />
              <span className="text-[10px] font-medium">Saved</span>
              {pathname === '/buyer/favorites' && <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />}
            </Link>
          )}

          <button onClick={() => setMenuOpen(true)} className={cn("relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors", menuOpen ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <MoreHorizontal className="h-6 w-6" />
            <span className="text-[10px] font-medium">More</span>
            {menuOpen && <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />}
          </button>
        </nav>
      </div>

      {/* AUTH PROMPT */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 md:hidden" onClick={() => setShowAuthPrompt(false)}>
          <div className="w-full max-w-sm rounded-3xl glass-card p-8 text-center animate-slide-up-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Unlock the Marketplace</h2>
            <p className="text-sm text-muted-foreground mb-8">Sign up to browse all fantastic products at PrimeMart.</p>
            <Link href="/signup" className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/20 mb-3">
              Create Free Account
            </Link>
            <button onClick={() => setShowAuthPrompt(false)} className="w-full rounded-xl py-3 text-sm font-medium text-muted-foreground hover:bg-secondary">
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* MORE MENU */}
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
                    <p className="text-sm font-semibold text-foreground truncate">{session.user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{isAdmin ? 'Admin' : isSeller ? 'Seller' : 'Buyer'}</p>
                  </div>

                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 bg-primary/10 text-primary mb-2">
                      <div className="flex items-center gap-3"><Shield className="h-5 w-5" /><span className="font-bold">Admin Panel</span></div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}

                  <Link href={isSeller ? "/seller/account" : "/buyer/account"} onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                    <div className="flex items-center gap-3"><User className="h-5 w-5 text-muted-foreground" /><span className="font-medium">My Profile</span></div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>

                  {isSeller && !sellerIsUnpaid && (
                    <>
                      <Link href="/seller/analytics" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                        <div className="flex items-center gap-3"><BarChart className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Analytics</span></div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                      <Link href="/seller/settings" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                        <div className="flex items-center gap-3"><Settings className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Store Settings</span></div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </>
                  )}
                  
                  {isBuyer && (
                    <Link href="/buyer/favorites" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary">
                      <div className="flex items-center gap-3"><Heart className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Saved Items</span></div>
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
                    <div className="flex items-center gap-3"><LogOut className="h-5 w-5" /><span className="font-medium">Sign Out</span></div>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex w-full items-center justify-center rounded-xl border border-border py-3 font-medium hover:bg-secondary">Sign In</Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="mt-2 flex w-full items-center justify-center rounded-xl bg-primary py-3 font-medium text-primary-foreground">Create Account</Link>
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