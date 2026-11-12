'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { SearchBar } from '@/features/marketplace/search';
import { ListingGrid, SkeletonGrid } from '@/features/marketplace/grid';
import { Loader2 } from 'lucide-react';

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

    // Add a tiny debounce for search
    const timer = setTimeout(() => {
      fetchListings();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background pt-8 pb-32">
      <div className="mx-auto max-w-7xl px-4">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground">Discover products from verified sellers.</p>
        </div>

        {/* Reusing your existing search component */}
        <div className="mb-8 max-w-2xl">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-background px-6 py-4 text-sm outline-none transition focus:border-primary"
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