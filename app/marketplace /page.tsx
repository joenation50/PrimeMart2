'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { ListingGrid, SkeletonGrid } from '@/features/marketplace/grid';
import { Search } from 'lucide-react';

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchListings() {
      const supabase = createBrowserSupabase();
      
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (!error && data) {
        setListings(data);
      }
      setLoading(false);
    }

    const timer = setTimeout(() => fetchListings(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background pt-8 pb-32">
      <div className="mx-auto max-w-7xl px-4">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground">Discover products from verified sellers.</p>
        </div>

        <div className="relative mb-8 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-background pl-12 pr-6 py-4 text-sm outline-none transition focus:border-primary"
          />
        </div>

        {loading ? (
          <SkeletonGrid count={8} />
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-border glass-card py-24 text-center">
            <p className="text-xl font-medium text-foreground">No listings found</p>
            <p className="mt-2 text-muted-foreground">Try adjusting your search.</p>
          </div>
        ) : (
          <ListingGrid listings={listings} showFavorites={true} />
        )}

      </div>
    </div>
  );
}