'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, Heart, Bell, User, Store, ArrowRight, 
  Search, ShieldCheck 
} from 'lucide-react';
import { ListingGrid } from '@/features/marketplace/grid';
import Image from 'next/image';

export default function BuyerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ favorites: 0, unread: 0 });
  const [recentListings, setRecentListings] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace('/login');
        return;
      }

      // 1. Fetch User Profile
      const { data: userData } = await supabase
        .from('users')
        .select('name, role, verification_level, avatar_url')
        .eq('id', user.id)
        .single();

      if (userData?.role === 'seller') {
        router.replace('/seller');
        return;
      }

      setProfile(userData);

      // 2. Fetch Stats (Favorites & Unread Notifications) in parallel
      const [favRes, notifRes] = await Promise.all([
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).is('read_at', null)
      ]);

      setStats({
        favorites: favRes.count || 0,
        unread: notifRes.count || 0
      });

      // 3. Fetch Recent Listings for Recommendations
      const { data: listings } = await supabase
        .from('listings')
        .select(`*, users(name, verification_level), seller_profiles(business_name)`)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4);

      setRecentListings(listings || []);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initial = (profile?.name ?? '?').charAt(0).toUpperCase();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 pb-32">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground overflow-hidden">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
            ) : (
              initial
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Welcome back, {profile?.name?.split(' ')[0] || 'Buyer'}!
              {profile?.verification_level === 'verified' && <ShieldCheck className="h-5 w-5 text-primary" />}
            </h1>
            <p className="text-muted-foreground">Here is what's happening with your account today.</p>
          </div>
        </div>
        <Link 
          href="/marketplace"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Search className="h-4 w-4" /> Browse Marketplace
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        
        {/* QUICK STATS */}
        <Link href="/buyer/favorites" className="glass-card rounded-3xl p-6 hover:bg-secondary/50 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
              <Heart className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{stats.favorites}</p>
          <p className="text-sm font-medium text-muted-foreground">Saved Items</p>
        </Link>

        <Link href="/buyer/notifications" className="glass-card rounded-3xl p-6 hover:bg-secondary/50 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 relative">
              <Bell className="h-6 w-6" />
              {stats.unread > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {stats.unread}
                </span>
              )}
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{stats.unread}</p>
          <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
        </Link>

        <Link href="/buyer/account" className="glass-card rounded-3xl p-6 hover:bg-secondary/50 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <User className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xl font-bold text-foreground mb-1 mt-3">My Account</p>
          <p className="text-sm font-medium text-muted-foreground">Manage details & settings</p>
        </Link>
      </div>

      {/* UPGRADE BANNER */}
      <div className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 to-blue-600/20 border border-primary/20 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="relative z-10 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center sm:justify-start gap-2">
            <Store className="h-6 w-6 text-primary" /> Start Selling Today
          </h2>
          <p className="text-muted-foreground max-w-md">Join thousands of sellers on PrimeMart. Create your own store, add products, and reach buyers instantly.</p>
        </div>
        <Link 
          href="/buyer/upgrade" 
          className="relative z-10 shrink-0 flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-8 py-3 text-sm font-bold hover:scale-105 transition-transform"
        >
          Become a Seller <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* RECENT LISTINGS */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Fresh Recommendations</h2>
          <Link href="/marketplace" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        
        {recentListings.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center text-muted-foreground">
            No listings available right now. Check back later!
          </div>
        ) : (
          <ListingGrid listings={recentListings} showFavorites={true} />
        )}
      </div>

    </div>
  );
}