'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Users, Store, ShoppingBag, DollarSign, Activity } from 'lucide-react';

export default function AdminAnalytics() {
  const [stats, setStats] = useState({ users: 0, sellers: 0, listings: 0, revenue: 0 });

  useEffect(() => {
    async function fetchStats() {
      const supabase = createBrowserSupabase();
      
      // Fetch basic counts
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: sellersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller');
      const { count: listingsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active');
      
      // Calculate revenue from approved payments
      const { data: payments } = await supabase.from('payments').select('amount, currency').eq('status', 'approved');
      const revenue = payments?.reduce((sum, p) => p.currency === 'NGN' ? sum + p.amount : sum, 0) || 0;

      setStats({
        users: usersCount || 0,
        sellers: sellersCount || 0,
        listings: listingsCount || 0,
        revenue: revenue
      });
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Platform Analytics</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl"><Users className="h-6 w-6 text-primary" /></div>
            <p className="text-sm font-medium text-muted-foreground">Total Users</p>
          </div>
          <p className="text-4xl font-bold text-foreground">{stats.users}</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl"><Store className="h-6 w-6 text-blue-500" /></div>
            <p className="text-sm font-medium text-muted-foreground">Active Sellers</p>
          </div>
          <p className="text-4xl font-bold text-foreground">{stats.sellers}</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl"><ShoppingBag className="h-6 w-6 text-amber-500" /></div>
            <p className="text-sm font-medium text-muted-foreground">Live Listings</p>
          </div>
          <p className="text-4xl font-bold text-foreground">{stats.listings}</p>
        </div>

        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <div className="relative z-10 flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl"><DollarSign className="h-6 w-6 text-green-500" /></div>
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
          </div>
          <p className="relative z-10 text-4xl font-bold text-green-500">₦{stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 text-center py-20">
        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">More charts coming soon</h2>
        <p className="text-muted-foreground">Daily active users and listing growth charts will appear here.</p>
      </div>
    </div>
  );
}