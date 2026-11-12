'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, Eye, MessageCircle, PlusCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { ListingRow } from '@/features/seller/ListingRow';

export default function AdminStoreDashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStore() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });

      setListings(data || []);
      setLoading(false);
    }
    fetchStore();
  }, []);

  const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0);
  const totalClicks = listings.reduce((sum, l) => sum + (l.click_count || 0), 0);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Store Dashboard</h1>
          <p className="text-muted-foreground">Manage your personal PrimeMart Official listings.</p>
        </div>
        <Link href="/admin/store/listings/new" className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:scale-105 transition-all">
          <PlusCircle className="h-4 w-4" /> Add New Product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
          <p className="mt-2 text-4xl font-bold text-foreground">{listings.filter(l => l.status === 'active').length}</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Views</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-4xl font-bold text-foreground">{totalViews}</p>
            <Eye className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm font-medium text-muted-foreground">WhatsApp Clicks</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-4xl font-bold text-primary">{totalClicks}</p>
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> My Products</h2>
        </div>
        {listings.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">You haven't added any products yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {listings.map((listing) => (
              <ListingRow key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}