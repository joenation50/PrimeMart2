'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { ListingGrid, SkeletonGrid } from '@/features/marketplace/grid';
import { Search, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'Fashion', 'Electronics', 'Home', 'Services', 'Vehicles'];

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setErrorMsg('');
      const supabase = createBrowserSupabase();
      
      let query = supabase
        .from('listings')
        .select(`
          *, 
          users(name, verification_level, store_slug), 
          seller_profiles!listings_seller_profile_fkey(business_name, logo_url)
        `)
        .eq('status', 'active');

      // UNIVERSAL SEARCH LOGIC
      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`;
        
        // Find sellers matching the search
        const { data: matchingSellers } = await supabase
          .from('seller_profiles')
          .select('user_id')
          .ilike('business_name', term);

        const sellerIds = matchingSellers?.map(s => s.user_id) || [];

        let orCondition = `title.ilike.${term},category.ilike.${term}`;
        if (sellerIds.length > 0) {
          orCondition += `,seller_id.in.(${sellerIds.join(',')})`;
        }
        query = query.or(orCondition);
      }

      if (activeCategory !== 'All' && !searchQuery) {
        query = query.ilike('category', activeCategory);
      }
      
      if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
      else if (sortBy === 'price_low') query = query.order('price', { ascending: true });
      else if (sortBy === 'price_high') query = query.order('price', { ascending: false });

      const { data, error } = await query;
      
      if (error) {
        setErrorMsg("Database Error: " + error.message);
      } else {
        setListings(data || []);
      }
      setLoading(false);
    }
    const timer = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, sortBy]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="relative overflow-hidden pt-8 pb-8">
        <div className="relative mx-auto max-w-7xl px-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Marketplace</h1>
          <p className="mt-2 text-muted-foreground">Search products, categories, or store names.</p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search iPhone, Fashion, Thrust Store..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full rounded-full border border-border bg-background pl-12 pr-6 py-4 text-sm outline-none focus:border-primary" 
              />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-full border border-border bg-background px-6 py-4 text-sm outline-none cursor-pointer">
              <option value="newest">Newest Arrivals</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 glass-nav border-b border-border">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-2 overflow-x-auto py-4 [scrollbar-width:none]">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => { setActiveCategory(cat); setSearchQuery(''); }} 
                className={cn("whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all", activeCategory === cat && !searchQuery ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}
        
        {loading ? <SkeletonGrid count={8} /> : listings.length === 0 && !errorMsg ? (
          <div className="text-center py-20 glass-card rounded-3xl">
            <p className="text-muted-foreground">No results found for "{searchQuery}". Try a different keyword.</p>
          </div>
        ) : (
          <ListingGrid listings={listings} showFavorites={true} />
        )}
      </div>
    </div>
  );
}