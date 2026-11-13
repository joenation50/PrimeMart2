'use client';

import { useEffect, useState, useRef } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { ListingCard, ListingGrid, SkeletonGrid } from '@/features/marketplace/grid';
import { 
  Search, Bell, Settings, ShoppingCart, AlertCircle, Package,
  Shirt, Smartphone, Home, Wrench, Car, Tag, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Match database categories to icons
const getCategoryStyle = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('fashion')) return { icon: Shirt, color: 'text-[#f472b6]' };
  if (normalized.includes('electronic')) return { icon: Smartphone, color: 'text-[#60a5fa]' };
  if (normalized.includes('home')) return { icon: Home, color: 'text-[#fb923c]' };
  if (normalized.includes('service')) return { icon: Wrench, color: 'text-[#4ade80]' };
  if (normalized.includes('vehicle') || normalized.includes('car')) return { icon: Car, color: 'text-[#facc15]' };
  return { icon: Tag, color: 'text-primary' };
};

const POPULAR_SEARCHES = ['iPhones', 'Laptops', 'Sneakers', 'Food', 'Hair', 'Perfumes'];

// 5-SECOND AUTO-SCROLLING ROW
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
        <ListingCard key={item.id} listing={item} />
      ))}
    </div>
  );
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null); // <-- User Profile State
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Fetch Initial Data (Banners, Categories, User Profile)
  useEffect(() => {
    async function fetchGlobalData() {
      const supabase = createBrowserSupabase();
      
      // 1. Fetch User Profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('name, role, seller_profiles(business_name)')
          .eq('id', user.id)
          .single();
        if (profile) setUserProfile(profile);
      }

      // 2. Fetch Banners & Categories
      const [bannerRes, catRes] = await Promise.all([
        supabase.from('banners').select('*').eq('active', true).order('created_at', { ascending: false }),
        supabase.from('categories').select('*').eq('active', true).order('sort_order')
      ]);
      
      if (bannerRes.data) setBanners(bannerRes.data);
      if (catRes.data) setCategories(catRes.data);
    }
    fetchGlobalData();
  }, []);

  // Fetch Listings with Search & Filters
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery, minPrice, maxPrice, activeCategory]);

  async function fetchListings() {
    setLoading(true);
    setErrorMsg('');
    const supabase = createBrowserSupabase();
    
    const isSearching = searchQuery.trim() !== '' || minPrice !== '' || maxPrice !== '' || activeCategory !== 'All';
    setHasSearched(isSearching);

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
        const { data: matchingSellers } = await supabase.from('seller_profiles').select('user_id').ilike('business_name', term);
        const sellerIds = matchingSellers?.map(s => s.user_id) || [];
        let orCondition = `title.ilike.${term},category.ilike.${term}`;
        if (sellerIds.length > 0) orCondition += `,seller_id.in.(${sellerIds.join(',')})`;
        query = query.or(orCondition);
      }

      if (minPrice && !isNaN(Number(minPrice))) query = query.gte('price', Number(minPrice));
      if (maxPrice && !isNaN(Number(maxPrice))) query = query.lte('price', Number(maxPrice));
      
      // If a category is clicked, filter by it
      if (activeCategory !== 'All') query = query.ilike('category', activeCategory);

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      setListings(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch items.');
    } finally {
      setLoading(false);
    }
  }

  // Handle clicking a category
  function handleCategoryClick(categoryName: string) {
    setSearchQuery(''); // Clear text search
    setActiveCategory(categoryName); // Set category to trigger fetch
  }

  // Clear all filters
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

  // Determine greeting name
  const greetingName = userProfile?.role === 'seller' 
    ? (userProfile?.seller_profiles?.business_name || userProfile?.name || 'Seller')
    : (userProfile?.name || 'Shopper');

  return (
    <div className="min-h-screen bg-background pb-32">
      
      {/* 1. GRADIENT HEADER */}
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

      {/* 2. OVERLAPPING SEARCH & FILTER CARD */}
      <div className="px-5 -mt-16 relative z-10">
        <div className="rounded-3xl bg-card p-4 shadow-xl border border-border">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            <input 
              type="text" 
              placeholder="Search items, brands..." 
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
              onClick={fetchListings}
              className="shrink-0 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* 3. POPULAR SEARCHES */}
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

      {/* 4. MAIN CONTENT AREA */}
      <div className="px-5 mt-6">
        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        {/* SEARCH RESULTS / FILTERED VIEW */}
        {hasSearched ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  {activeCategory !== 'All' ? `Best in ${activeCategory}` : 'Matched Items'}
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
                <h3 className="text-xl font-bold text-foreground mb-2">No items found</h3>
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
        ) : (
          
          /* HOMEPAGE VIEW (Categories, Banners, Grouped Rows) */
          <div className="space-y-8">
            
            {/* HERO BANNER FROM ADMIN */}
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

            {/* CATEGORY GRID */}
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

                {/* GROUPED LISTINGS BY CATEGORY */}
                {Object.entries(groupedListings).map(([category, items]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-foreground">Best in {category}</h2>
                      {/* TAPPING THIS TRIGGERS THE FILTER VIEW */}
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