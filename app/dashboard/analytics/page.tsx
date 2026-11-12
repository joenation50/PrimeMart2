'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { BarChart, Eye, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SellerAnalyticsPage() {
  const [stats, setStats] = useState({ views: 0, clicks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all listings by this seller
      const { data: listings } = await supabase.from('listings').select('id').eq('seller_id', user.id);
      
      if (listings && listings.length > 0) {
        const listingIds = listings.map(l => l.id);
        
        // Count views
        const { count: viewCount } = await supabase.from('listing_events').select('*', { count: 'exact', head: true }).in('listing_id', listingIds).eq('event_type', 'view');
        
        // Count clicks
        const { count: clickCount } = await supabase.from('listing_events').select('*', { count: 'exact', head: true }).in('listing_id', listingIds).eq('event_type', 'whatsapp_click');

        setStats({ views: viewCount || 0, clicks: clickCount || 0 });
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 pb-32">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <BarChart className="h-8 w-8 text-primary" /> Store Analytics
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Views</p>
          <p className="text-5xl font-bold text-foreground">{stats.views}</p>
        </div>

        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-2">WhatsApp Clicks</p>
          <p className="text-5xl font-bold text-foreground">{stats.clicks}</p>
        </div>
      </div>
    </div>
  );
}