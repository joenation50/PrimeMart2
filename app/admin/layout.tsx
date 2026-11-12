'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Settings, FileText, AlertTriangle, 
  Loader2, ArrowLeft, LogOut, ShieldCheck, Menu, X, BarChart, Store, ShoppingBag, PlusCircle
} from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-browser';

const ADMIN_EMAIL = 'joenation98@gmail.com';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        window.location.href = '/admin/login';
        return;
      }
      setLoading(false);
    }

    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }
    checkAdmin();
  }, [pathname]);

  async function handleLogout() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const platformLinks = [
    { href: '/admin', label: 'Approval Queue', icon: LayoutDashboard },
    { href: '/admin/analytics', label: 'Platform Analytics', icon: BarChart },
    { href: '/admin/users', label: 'Users & Sellers', icon: Users },
    { href: '/admin/listings', label: 'All Listings', icon: ShoppingBag },
    { href: '/admin/moderation', label: 'Moderation', icon: AlertTriangle },
    { href: '/admin/content', label: 'Content', icon: FileText },
    { href: '/admin/system', label: 'System Settings', icon: Settings },
  ];

  const storeLinks = [
    { href: '/admin/store', label: 'Store Dashboard', icon: Store },
    { href: '/admin/store/listings/new', label: 'Add New Product', icon: PlusCircle },
    { href: '/admin/store/analytics', label: 'Store Analytics', icon: BarChart },
    { href: '/admin/store/settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      
      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="font-bold">Admin</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background pt-16 overflow-y-auto pb-24">
          <nav className="p-4 space-y-6">
            <div>
              <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Platform Admin</p>
              {platformLinks.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium ${pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                  <item.icon className="h-5 w-5" /> {item.label}
                </Link>
              ))}
            </div>
            <div>
              <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">My Store (Seller Tools)</p>
              {storeLinks.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium ${pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                  <item.icon className="h-5 w-5" /> {item.label}
                </Link>
              ))}
            </div>
            <div className="pt-4 border-t border-border space-y-2">
              <Link href="/marketplace" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary">
                <ArrowLeft className="h-5 w-5" /> Back to Marketplace
              </Link>
              <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10">
                <LogOut className="h-5 w-5" /> Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border glass-card h-screen sticky top-0">
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Control Center</h2>
          </Link>
          <p className="text-xs text-muted-foreground truncate">{ADMIN_EMAIL}</p>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Platform Admin</p>
            <div className="space-y-1">
              {platformLinks.map(item => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}>
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">My Store (Seller Tools)</p>
            <div className="space-y-1">
              {storeLinks.map(item => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}>
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Link href="/marketplace" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-4rem)] md:h-screen">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}