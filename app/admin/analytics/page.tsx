'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Users, Store, ShoppingBag, DollarSign, Calendar } from 'lucide-react';
import { formatDate, formatPrice } from '@/lib/format';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({ users: 0, sellers: 0, listings: 0, revenue: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createBrowserSupabase();
      
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: sellersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller');
      const { count: listingsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });
      
      const { data: payments } = await supabase.from('payments').select('amount').eq('status', 'approved');
      
      // FIXED: Using Number() to prevent string concatenation
      const revenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      const { data: recent } = await supabase.from('users').select('name, email, created_at').order('created_at', { ascending: false }).limit(5);

      setStats({ users: usersCount || 0, sellers: sellersCount || 0, listings: listingsCount || 0, revenue });
      setRecentUsers(recent || []);
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return <div className="p-8">Loading analytics...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Platform Analytics</h1>
      
      {/* STAT CARDS */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="h-16 w-16" /></div>
          <p className="text-sm text-muted-foreground font-medium">Total Users</p>
          <p className="text-4xl font-extrabold text-foreground mt-2">{stats.users}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Store className="h-16 w-16" /></div>
          <p className="text-sm text-muted-foreground font-medium">Active Sellers</p>
          <p className="text-4xl font-extrabold text-foreground mt-2">{stats.sellers}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingBag className="h-16 w-16" /></div>
          <p className="text-sm text-muted-foreground font-medium">Live Listings</p>
          <p className="text-4xl font-extrabold text-foreground mt-2">{stats.listings}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden border-primary/20 bg-primary/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-primary"><DollarSign className="h-16 w-16" /></div>
          <p className="text-sm text-primary font-medium">Total Revenue</p>
          <p className="text-4xl font-extrabold text-primary mt-2">{formatPrice(stats.revenue, 'NGN')}</p>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Recently Joined</h2>
        </div>
        <div className="divide-y divide-border">
          {recentUsers.map((u, i) => (
            <div key={i} className="flex items-center justify-between p-4 px-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{formatDate(u.created_at)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}