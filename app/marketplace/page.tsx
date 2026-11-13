'use client';

import { useEffect, useState, useRef } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { ListingCard, ListingGrid, SkeletonGrid } from '@/features/marketplace/grid';
import { 
  Search, Bell, Settings, ShoppingCart, AlertCircle, Package,
  Shirt, Smartphone, Home, Wrench, Car, Tag, CheckCircle2, Store,
  Soup, Flower2, Truck, HeartPulse, BookOpen, Laptop, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Match database categories to icons
const getCategoryStyle = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('fashion')) return { icon: Shirt, color: 'text-[#f472b6]' };
  if (normalized.includes('electronic')) return { icon: Smartphone, color: 'text-[#60a5fa]' };
  if (normalized.includes('gadget')) return { icon: Laptop, color: 'text-[#818cf8]' };
  if (normalized.includes('home')) return { icon: Home, color: 'text-[#fb923c]' };
  if (normalized.includes('service')) return { icon: Wrench, color: 'text-[#4ade80]' };
  if (normalized.includes('vehicle') || normalized.includes('car')) return { icon: Car, color: 'text-[#facc15]' };
  if (normalized.includes('transport')) return { icon: Truck, color: 'text-[#fbbf24]' };
  if (normalized.includes('food')) return { icon: Soup, color: 'text-[#f97316]' };
  if (normalized.includes('beauty')) return { icon: Flower2, color: 'text-[#fb7185]' };
  if (normalized.includes('health')) return { icon: HeartPulse, color: 'text-[#ef4444]' };
  if (normalized.includes('tutorial')) return { icon: BookOpen, color: 'text-[#a78bfa]' };
  return { icon: Tag, color: 'text-primary' };
};

const POPULAR_SEARCHES = ['iPhones', 'Laptops', 'Sneakers', 'Food', 'Hair', 'Perfumes'];

// 5-SECOND AUTO-SCROLLING ROW (FIXED SIZING)
function AutoScrollRow({ items }: { items: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 160, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => (
        // FIXED: Wrapped in a fixed-width container (160px) so they don't stretch
        <div key={item.id} className="w-[160px] shrink-0">
          <ListingCard listing={item} />
        </div>
      ))}
    </div>
  );
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [searchedSellers, setSearchedSellers] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [verifiedSellers, setVerifiedSellers] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Fetch Initial Data
  useEffect(() => {
    async function fetchGlobalData() {
      const supabase = createBrowserSupabase();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('name, role, seller_profiles(business_name)')
          .eq('id', user.id)
          .single();
        if (profile) setUserProfile(profile);
      }

      const [bannerRes, catRes, sellerRes] = await Promise.all([
        supabase.from('banners').select('*').eq('active', true).order('created_at', { ascending: false }),
        supabase.from('categories').select('*').eq('active', true).order('sort_order'),
        supabase.from('users')
          .select(`id, name, store_slug, seller_code, verification_level, seller_profiles(business_name, logo_url, based_city)`)
          .eq('verification_level', 'verified')
          .in('role', ['seller', 'admin'])
          .limit(6)
      ]);
      
      if (bannerRes.data) setBanners(bannerRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (sellerRes.data) setVerifiedSellers(sellerRes.data);
    }
    fetchGlobalData();
  }, []);

  // Fetch Listings & Sellers
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, minPrice, maxPrice, activeCategory]);

  async function performSearch() {
    setLoading(true);
    setErrorMsg('');
    const supabase = createBrowserSupabase();
    
    const isSearching = searchQuery.trim() !== '' || minPrice !== '' || maxPrice !== '' || activeCategory !== 'All';
    setHasSearched(isSearching);

    try {
      // 1. SEARCH SELLERS
      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`;
        const { data: profiles } = await supabase.from('seller_profiles').select('user_id').ilike('business_name', term);
        const { data: users } = await supabase.from('users').select('id').in('role', ['seller', 'admin']).ilike('name', term);

        const profileIds = profiles?.map(p => p.user_id) || [];
        const userIds = users?.map(u => u.id) || [];
        const allIds = Array.from(new Set(profileIds.concat(userIds)));

        if (allIds.length > 0) {
          const { data: sellersData } = await supabase
            .from('users')
            .select(`id, name, store_slug, seller_code, verification_level, seller_profiles(business_name, logo_url, based_city)`)
            .in('id', allIds);
          setSearchedSellers(sellersData || []);
        } else {
          setSearchedSellers([]);
        }
      } else {
        setSearchedSellers([]);
      }

      // 2. SEARCH LISTINGS
      let query = supabase
        .from('listings')
        .select(`*, users(name, verification_level, store_slug), seller_profiles!listings_seller_profile_fkey(business_name, logo_url)`)
        .eq('status', 'active');

      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`;
        const { data: matchingSellers } = await supabase.from('seller_profiles').select('user_id').ilike('business_name', term);
        const sellerIds = matchingSellers?.map(s => s.user_id) || [];
        let orCondition = `title.ilike.${term},category.ilike.${term}`;
        if (sellerIds.length > 0) orCondition += `,seller_id.in.(${sellerIds.join(',')})`;
        query = query.or(orCondition);
      }

      if (minPrice && !isNaN(Number(minPrice))) query = query.gte('price', Number(minPrice));
      if (maxPrice && !isNaN(Number(maxPrice))) query = query.lte('price', Number(maxPrice));
      if (activeCategory !== 'All') query = query.ilike('category', activeCategory);

      query = query.order('created_at', { ascending: false });

      const { data: listingsData, error: listingsError } = await query;
      if (listingsError) throw new Error(listingsError.message);
      setListings(listingsData || []);

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch items.');
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryClick(categoryName: string) {
    setSearchQuery(''); 
    setActiveCategory(categoryName); 
  }

  function clearFilters() {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setActiveCategory('All');
  }

  const groupedListings = listings.reduce((acc, listing) => {
    const cat = listing.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(listing);
    return acc;
  }, {} as Record<string, any[]>);

  const recommended = listings.slice(0, 6);

  const greetingName = userProfile?.role === 'seller' || userProfile?.role === 'admin'
    ? (userProfile?.seller_profiles?.business_name || userProfile?.name || 'Seller')
    : (userProfile?.name || 'Shopper');

  return (
    <div className="min-h-screen bg-background pb-32">
      
      {/* HEADER */}
      <div className="relative bg-gradient-to-b from-primary to-emerald-900 pt-8 pb-24 px-5 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <ShoppingCart className="h-8 w-8 text-white" />
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold text-white flex items-center gap-1">
              Hi, {greetingName} <span className="text-xl">👋</span>
            </h1>
            <p className="text-[13px] text-white/80 mt-0.5">Find everything you need</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/buyer/account" className="text-white hover:text-white/80">
              <Settings className="h-6 w-6" />
            </Link>
            <Link href="/buyer/notifications" className="text-white hover:text-white/80">
              <Bell className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER CARD */}
      <div className="px-5 -mt-16 relative z-10">
        <div className="rounded-3xl bg-card p-4 shadow-xl border border-border">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            <input 
              type="text" 
              placeholder="Search items, brands, or stores..." 
              value={searchQuery} 
              onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory('All'); }} 
              className="w-full rounded-2xl border border-border bg-background pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" 
            />
          </div>

          <div className="flex gap-3">
            <input 
              type="number" 
              placeholder="Min (₦)" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" 
            />
            <input 
              type="number" 
              placeholder="Max (₦)" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" 
            />
            <button 
              onClick={performSearch}
              className="shrink-0 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* POPULAR SEARCHES */}
      {!hasSearched && (
        <div className="px-5 mt-6 mb-8">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Popular Searches</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <button 
                key={term}
                onClick={() => { setSearchQuery(term); setActiveCategory('All'); }}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="px-5 mt-6">
        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        {hasSearched ? (
          <div className="space-y-8">
            
            {/* MATCHING SELLERS */}
            {searchedSellers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Store className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Matching Stores</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {searchedSellers.map((seller) => {
                    const storeName = seller.seller_profiles?.business_name || seller.name || 'Verified Store';
                    const storeLogo = seller.seller_profiles?.logo_url;
                    const storeSlug = seller.store_slug || seller.seller_code;
                    
                    return (
                      <Link 
                        key={seller.id} 
                        href={`/store/${storeSlug}`}
                        className="w-[140px] shrink-0 flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-4 text-center shadow-sm transition-transform hover:-translate-y-1"
                      >
                        <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full bg-muted flex items-center justify-center border border-border">
                          {storeLogo ? <Image src={storeLogo} alt={storeName} fill className="object-cover" /> : <Store className="h-6 w-6 text-muted-foreground" />}
                        </div>
                        <div className="flex items-center justify-center gap-1 w-full mb-1">
                          <h3 className="font-bold text-foreground text-[13px] truncate max-w-[90px]">{storeName}</h3>
                          {seller.verification_level === 'verified' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />}
                        </div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase truncate w-full">
                          {seller.seller_profiles?.based_city || 'Top Seller'}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MATCHING PRODUCTS */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">
                    {activeCategory !== 'All' ? `Best in ${activeCategory}` : 'Matching Products'}
                  </h2>
                </div>
                <button onClick={clearFilters} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                  Clear Filters
                </button>
              </div>

              {loading ? (
                <SkeletonGrid count={4} />
              ) : listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/50 py-16 px-6 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-background">
                    <Search className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No products found</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    Try adjusting your price filters or checking your spelling.
                  </p>
                  <button onClick={clearFilters} className="mt-6 text-sm font-bold text-primary">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <ListingGrid listings={listings} />
              )}
            </div>
          </div>
        ) : (
          /* HOMEPAGE VIEW */
          <div className="space-y-8">
            
            {/* BANNERS */}
            {banners.length > 0 && (
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {banners.map((banner) => (
                  <Link 
                    key={banner.id} 
                    href={banner.cta_url || '/marketplace'} 
                    className="group relative flex h-[160px] w-full shrink-0 snap-center overflow-hidden rounded-3xl bg-primary"
                  >
                    {banner.image_url && (
                      <Image src={banner.image_url} alt={banner.headline} fill className="object-cover opacity-30 mix-blend-overlay" />
                    )}
                    <div className="relative z-10 flex flex-col justify-center p-6 w-3/4">
                      <h2 className="text-2xl font-extrabold text-primary-foreground leading-tight">{banner.headline}</h2>
                      {banner.subtext && <p className="mt-2 text-sm text-primary-foreground/90">{banner.subtext}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* CATEGORIES */}
            {categories.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Categories</h2>
                <div className="grid grid-cols-4 gap-y-6 gap-x-3">
                  {categories.map((cat) => {
                    const { icon: Icon, color } = getCategoryStyle(cat.name);
                    return (
                      <button 
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.name)}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl transition-all border shadow-sm bg-card border-border group-hover:bg-muted">
                          <Icon className={cn("h-7 w-7", color)} strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] font-semibold text-center truncate w-full px-1 text-foreground">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VERIFIED SELLERS */}
            {verifiedSellers.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" /> Verified Sellers
                  </h2>
                  <Link href="/verified-sellers" className="text-sm font-semibold text-primary hover:underline">
                    See all
                  </Link>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {verifiedSellers.map((seller) => {
                    const storeName = seller.seller_profiles?.business_name || seller.name || 'Verified Store';
                    const storeLogo = seller.seller_profiles?.logo_url;
                    const storeSlug = seller.store_slug || seller.seller_code;
                    
                    return (
                      <Link 
                        key={seller.id} 
                        href={`/store/${storeSlug}`}
                        className="w-[140px] shrink-0 flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-4 text-center shadow-sm transition-transform hover:-translate-y-1"
                      >
                        <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full bg-muted flex items-center justify-center border border-border">
                          {storeLogo ? <Image src={storeLogo} alt={storeName} fill className="object-cover" /> : <Store className="h-6 w-6 text-muted-foreground" />}
                        </div>
                        <div className="flex items-center justify-center gap-1 w-full mb-1">
                          <h3 className="font-bold text-foreground text-[13px] truncate max-w-[90px]">{storeName}</h3>
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                        </div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase truncate w-full">
                          {seller.seller_profiles?.based_city || 'Top Seller'}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AUTO-SCROLL ROWS */}
            {loading ? (
              <div className="space-y-8">
                <div>
                  <div className="h-6 w-32 animate-pulse rounded bg-muted mb-4" />
                  <SkeletonGrid count={4} />
                </div>
              </div>
            ) : (
              <>
                {recommended.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">Recommended for you</h2>
                    <AutoScrollRow items={recommended} />
                  </div>
                )}

                {Object.entries(groupedListings).map(([category, items]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-foreground">Best in {category}</h2>
                      <button 
                        onClick={() => handleCategoryClick(category)} 
                        className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline"
                      >
                        See all <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <AutoScrollRow items={items as any[]} />
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}