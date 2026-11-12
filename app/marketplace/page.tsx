'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { ListingGrid, SkeletonGrid } from '@/features/marketplace/grid';
import { Search, SlidersHorizontal, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = ['All', 'Fashion', 'Electronics', 'Home', 'Services', 'Vehicles'];

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createBrowserSupabase();
      
      // 1. Fetch Banners
      const { data: bannersData } = await supabase.from('banners').select('*').eq('active', true).order('created_at', { ascending: false });
      if (bannersData) setBanners(bannersData);

      // 2. Fetch Listings
      let query = supabase
        .from('listings')
        .select(`*, users(name, verification_level), seller_profiles(business_name)`)
        .eq('status', 'active');

      if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);
      if (activeCategory !== 'All') query = query.eq('category', activeCategory.toLowerCase()); 
      
      if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
      else if (sortBy === 'price_low') query = query.order('price', { ascending: true });
      else if (sortBy === 'price_high') query = query.order('price', { ascending: false });

      const { data } = await query;
      
      // Filter verified if toggle is on
      let finalListings = data || [];
      if (verifiedOnly) {
        finalListings = finalListings.filter(l => l.users?.verification_level === 'verified');
      }
      
      setListings(finalListings);
      setLoading(false);
    }
    const timer = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, sortBy, verifiedOnly]);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* BANNERS */}
      {banners.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pt-6">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {banners.map((banner) => (
              <Link key={banner.id} href={banner.cta_url || '/marketplace'} className="group relative flex min-h-[160px] w-full shrink-0 snap-center overflow-hidden rounded-3xl border border-border bg-primary">
                {banner.image_url && banner.image_url !== 'placeholder' ? (
                  <Image src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,h_400,c_fill,q_auto,f_auto/${banner.image_url}`} alt={banner.headline} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
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

      {/* HEADER */}
      <div className="relative overflow-hidden pt-8 pb-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Discover</h1>
          <p className="mt-2 text-lg text-muted-foreground">Find exactly what you need from verified sellers.</p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-4xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-full border border-border bg-background pl-12 pr-6 py-4 text-sm outline-none focus:border-primary shadow-sm" />
            </div>
            
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-full border border-border bg-background px-6 py-4 text-sm outline-none cursor-pointer shadow-sm">
              <option value="newest">Newest Arrivals</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="sticky top-16 z-30 glass-nav border-b border-border">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-4 [scrollbar-width:none]">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all", activeCategory === cat ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary/50 text-foreground hover:bg-secondary")}>
                {cat}
              </button>
            ))}
            <div className="w-px h-6 bg-border mx-2 shrink-0" />
            <button onClick={() => setVerifiedOnly(!verifiedOnly)} className={cn("whitespace-nowrap flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-all", verifiedOnly ? "bg-blue-500 text-white shadow-md" : "bg-secondary/50 text-foreground hover:bg-secondary")}>
              <ShieldCheck className="h-4 w-4" /> Verified Only
            </button>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {loading ? <SkeletonGrid count={8} /> : listings.length === 0 ? (
          <div className="rounded-3xl border border-border glass-card py-24 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary"><Search className="h-8 w-8 text-muted-foreground" /></div>
            <h2 className="text-xl font-bold text-foreground">No products found</h2>
            <p className="mt-2 text-muted-foreground">Try adjusting your search or category filters.</p>
          </div>
        ) : (
          <ListingGrid listings={listings} showFavorites={true} />
        )}
      </div>
    </div>
  );
}