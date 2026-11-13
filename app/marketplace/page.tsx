'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { ListingGrid, SkeletonGrid } from '@/features/marketplace/grid';
import { Search, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = ['All', 'Fashion', 'Electronics', 'Home', 'Services', 'Vehicles'];

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]); // <-- BANNER STATE
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // 1. FETCH ACTIVE BANNERS
  useEffect(() => {
    async function fetchBanners() {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setBanners(data);
      }
    }
    fetchBanners();
  }, []);

  // 2. FETCH LISTINGS (WITH UNIVERSAL SEARCH)
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
      
      {/* --- BANNER CAROUSEL --- */}
      {banners.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pt-6">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {banners.map((banner) => (
              <Link 
                key={banner.id} 
                href={banner.cta_url || '/marketplace'} 
                className="group relative flex min-h-[160px] w-full shrink-0 snap-center overflow-hidden rounded-3xl border border-border bg-primary"
              >
                {banner.image_url ? (
                  <Image 
                    src={banner.image_url} 
                    alt={banner.headline} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600" />
                )}
                
                <div className="absolute inset-0 bg-black/40" />
                
                <div className="relative z-10 flex w-full items-center justify-between p-6 sm:p-10">
                  <div>
                    <h2 className="text-xl font-bold text-white sm:text-3xl">{banner.headline}</h2>
                    {banner.subtext && <p className="mt-2 text-sm text-white/90 sm:text-base">{banner.subtext}</p>}
                  </div>
                  
                  {banner.cta_text && (
                    <span className="hidden shrink-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-black sm:flex items-center gap-2">
                      {banner.cta_text} <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* HEADER & SEARCH */}
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

      {/* CATEGORY FILTERS */}
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

      {/* LISTINGS GRID */}
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