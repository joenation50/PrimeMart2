'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { ListingGrid, SkeletonGrid } from '@/features/marketplace/grid';
import { Search, ArrowLeft, Package, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const POPULAR_SEARCHES = ['iPhones', 'Laptops', 'Sneakers', 'Food', 'Hair', 'Perfumes'];

export default function SearchMarketPage() {
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced Search Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() || minPrice || maxPrice) {
        performSearch();
      } else {
        setListings([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, minPrice, maxPrice]);

  async function performSearch() {
    setLoading(true);
    setErrorMsg('');
    setHasSearched(true);
    const supabase = createBrowserSupabase();

    try {
      let query = supabase
        .from('listings')
        .select(`
          *, 
          users(name, verification_level, store_slug), 
          seller_profiles!listings_seller_profile_fkey(business_name, logo_url)
        `)
        .eq('status', 'active');

      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`;
        // Search by title, category, or seller name
        const { data: matchingSellers } = await supabase.from('seller_profiles').select('user_id').ilike('business_name', term);
        const sellerIds = matchingSellers?.map(s => s.user_id) || [];
        
        let orCondition = `title.ilike.${term},category.ilike.${term}`;
        if (sellerIds.length > 0) {
          orCondition += `,seller_id.in.(${sellerIds.join(',')})`;
        }
        query = query.or(orCondition);
      }

      // Price Filters
      if (minPrice && !isNaN(Number(minPrice))) {
        query = query.gte('price', Number(minPrice));
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        query = query.lte('price', Number(maxPrice));
      }

      // Order by newest
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw new Error(error.message);
      setListings(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to search items.');
    } finally {
      setLoading(false);
    }
  }

  function handlePopularSearch(term: string) {
    setSearchQuery(term);
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      
      {/* HEADER WITH GRADIENT */}
      <div className="relative bg-gradient-to-b from-blue-700 to-blue-900 pt-12 pb-24 px-4 rounded-b-[2rem]">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.back()} 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Search Market</h1>
        </div>
      </div>

      {/* SEARCH & FILTER CARD (OVERLAPPING HEADER) */}
      <div className="px-4 -mt-16 relative z-10">
        <div className="rounded-3xl bg-[#131d3b] p-4 shadow-xl border border-white/5">
          {/* Main Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
            <input 
              type="text" 
              placeholder="Search items, brands..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full rounded-2xl border border-white/10 bg-[#0a1128] pl-12 pr-4 py-4 text-sm text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          {/* Price Filters */}
          <div className="flex gap-3">
            <input 
              type="number" 
              placeholder="Min (₦)" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#0a1128] px-4 py-3 text-sm text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="number" 
              placeholder="Max (₦)" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#0a1128] px-4 py-3 text-sm text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <button 
              onClick={performSearch}
              className="shrink-0 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* POPULAR SEARCHES */}
      <div className="px-4 mt-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Popular Searches</h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((term) => (
            <button 
              key={term}
              onClick={() => handlePopularSearch(term)}
              className="rounded-full border border-white/10 bg-[#131d3b] px-4 py-2 text-sm font-medium text-gray-300 hover:bg-[#1a2b5c] transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS SECTION */}
      <div className="px-4 mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-bold text-white">Matched Items</h2>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        {loading ? (
          <SkeletonGrid count={4} />
        ) : hasSearched && listings.length === 0 ? (
          
          /* EXACT EMPTY STATE FROM SCREENSHOT */
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-[#131d3b]/50 py-16 px-6 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#0a1128]">
              <Search className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No items found</h3>
            <p className="text-sm text-gray-400 max-w-[250px]">
              Try adjusting your price filters or checking your spelling.
            </p>
          </div>
          
        ) : listings.length > 0 ? (
          <ListingGrid listings={listings} />
        ) : null}
      </div>
    </div>
  );
}