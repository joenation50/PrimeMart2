'use client';

import { useEffect, useState, useRef } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { ListingCard, ListingGrid, SkeletonGrid } from '@/features/marketplace/grid';
import { 
  Search, Bell, Settings, AlertCircle, Package,
  Shirt, Smartphone, Home, Wrench, Car, Tag, CheckCircle2, Store,
  Soup, Flower2, Truck, HeartPulse, BookOpen, Laptop, ArrowRight, Sparkles, TrendingUp, X, SlidersHorizontal
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const getCategoryStyle = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('fashion')) return { icon: Shirt, color: 'text-pink-500', bg: 'bg-pink-500/10' };
  if (normalized.includes('electronic')) return { icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-500/10' };
  if (normalized.includes('gadget')) return { icon: Laptop, color: 'text-indigo-500', bg: 'bg-indigo-500/10' };
  if (normalized.includes('home')) return { icon: Home, color: 'text-orange-500', bg: 'bg-orange-500/10' };
  if (normalized.includes('service')) return { icon: Wrench, color: 'text-green-500', bg: 'bg-green-500/10' };
  if (normalized.includes('vehicle') || normalized.includes('car')) return { icon: Car, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
  if (normalized.includes('transport')) return { icon: Truck, color: 'text-amber-500', bg: 'bg-amber-500/10' };
  if (normalized.includes('food')) return { icon: Soup, color: 'text-orange-600', bg: 'bg-orange-600/10' };
  if (normalized.includes('beauty')) return { icon: Flower2, color: 'text-rose-500', bg: 'bg-rose-500/10' };
  if (normalized.includes('health')) return { icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-500/10' };
  if (normalized.includes('tutorial')) return { icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' };
  return { icon: Tag, color: 'text-primary', bg: 'bg-primary/10' };
};

const POPULAR_SEARCHES = ['iPhones', 'Laptops', 'Sneakers', 'Food', 'Hair', 'Perfumes'];

function AutoScrollRow({ items }: { items: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 180, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 hidden sm:block" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 hidden sm:block" />
      
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
        {items.map((item) => (
          <div key={item.id} className="w-[170px] sm:w-[200px] shrink-0 snap-start">
            <ListingCard listing={item} />
          </div>
        ))}
      </div>
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

  useEffect(() => {
    async function fetchGlobalData() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('users').select('name, role, seller_profiles(business_name)').eq('id', user.id).single();
        if (profile) setUserProfile(profile);
      }

      const [bannerRes, catRes, sellerRes] = await Promise.all([
        supabase.from('banners').select('*').eq('active', true).order('created_at', { ascending: false }),
        supabase.from('categories').select('*').eq('active', true).order('sort_order'),
        supabase.from('users').select(`id, name, store_slug, seller_code, verification_level, seller_profiles(business_name, logo_url, based_city)`).eq('verification_level', 'verified').in('role', ['seller', 'admin']).limit(6)
      ]);
      
      if (bannerRes.data) setBanners(bannerRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (sellerRes.data) setVerifiedSellers(sellerRes.data);
    }
    fetchGlobalData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { performSearch(); }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, minPrice, maxPrice, activeCategory]);

  async function performSearch() {
    setLoading(true);
    setErrorMsg('');
    const supabase = createBrowserSupabase();
    
    const isSearching = searchQuery.trim() !== '' || minPrice !== '' || maxPrice !== '' || activeCategory !== 'All';
    setHasSearched(isSearching);

    try {
      let sellerIds: string[] = [];
      const rawTerm = searchQuery.trim();

      if (rawTerm) {
        const term = `%${rawTerm}%`;
        const { data: profiles } = await supabase.from('seller_profiles').select('user_id').ilike('business_name', term);
        const { data: users } = await supabase.from('users').select('id').in('role', ['seller', 'admin']).ilike('name', term);
        
        sellerIds = Array.from(new Set([...(profiles?.map(p => p.user_id) || []), ...(users?.map(u => u.id) || [])]));

        if (sellerIds.length > 0) {
          const { data: sellersData } = await supabase.from('users').select(`id, name, store_slug, seller_code, verification_level, seller_profiles(business_name, logo_url, based_city)`).in('id', sellerIds);
          setSearchedSellers(sellersData || []);
        } else { 
          setSearchedSellers([]); 
        }
      } else { 
        setSearchedSellers([]); 
      }

      let query = supabase.from('listings').select(`*, users(name, verification_level, store_slug), seller_profiles!listings_seller_profile_fkey(business_name, logo_url)`).eq('status', 'active');

      if (rawTerm) {
        const term = `%${rawTerm}%`;
        let orCondition = `title.ilike.${term},category.ilike.${term},description.ilike.${term}`;
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
    <div className="min-h-screen bg-background pb-32 transition-colors duration-300">
      
      {/* PREMIUM GREEN HEADER */}
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-emerald-950 pt-12 pb-28 px-5 rounded-b-[2.5rem] shadow-sm overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Hi, {greetingName} <span className="text-2xl">👋</span>
            </h1>
            <p className="text-sm text-white/80 mt-1 font-medium">What are you shopping for today?</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/buyer/account" className="p-2.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all backdrop-blur-md shadow-sm">
              <Settings className="h-5 w-5" />
            </Link>
            <Link href="/buyer/notifications" className="relative p-2.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all backdrop-blur-md shadow-sm">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-emerald-600"></span>
            </Link>
          </div>
        </div>
      </div>

      {/* FLOATING SEARCH & FILTER CARD */}
      <div className="relative z-20 px-5 -mt-16 mb-8">
        <div className="rounded-[2rem] bg-card p-4 shadow-xl border border-border">
          
          <div className="relative flex items-center w-full h-12 rounded-xl bg-secondary border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all mb-3 overflow-hidden">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search products, brands, or stores..." 
              value={searchQuery} 
              onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory('All'); }} 
              className="w-full h-full bg-transparent pl-12 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm font-medium" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 p-1.5 rounded-full bg-border/50 text-muted-foreground hover:bg-border transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex-1 flex gap-2">
              <input type="number" placeholder="Min ₦" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
              <input type="number" placeholder="Max ₦" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
            </div>
            <button onClick={performSearch} className="shrink-0 flex items-center justify-center h-[42px] w-[42px] rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5">
        
        {/* POPULAR SEARCHES */}
        {!hasSearched && (
          <div className="mb-10">
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button key={term} onClick={() => { setSearchQuery(term); setActiveCategory('All'); }} className="group rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary hover:border-primary/30 transition-all flex items-center gap-1.5 shadow-sm">
                  <TrendingUp className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" /> {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {hasSearched ? (
          <div className="space-y-10">
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
                      <Link key={seller.id} href={`/store/${storeSlug}`} className="w-[140px] shrink-0 flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-5 text-center hover:border-primary/30 hover:shadow-md transition-all shadow-sm">
                        <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full bg-secondary flex items-center justify-center border border-border">
                          {storeLogo ? <Image src={storeLogo} alt={storeName} fill className="object-cover" /> : <Store className="h-6 w-6 text-muted-foreground" />}
                        </div>
                        <div className="flex items-center justify-center gap-1 w-full mb-1">
                          <h3 className="font-bold text-foreground text-[13px] truncate max-w-[90px]">{storeName}</h3>
                          {seller.verification_level === 'verified' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />}
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate w-full">{seller.seller_profiles?.based_city || 'Top Seller'}</p>
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
                  <h2 className="text-lg font-bold text-foreground">{activeCategory !== 'All' ? `Best in ${activeCategory}` : 'Matching Products'}</h2>
                </div>
                <button onClick={clearFilters} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors bg-secondary px-3 py-1.5 rounded-lg border border-border">Clear Filters</button>
              </div>

              {loading ? (
                <SkeletonGrid count={4} />
              ) : listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[2rem] border border-border bg-card py-20 px-6 text-center shadow-sm">
                  <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-secondary border border-border">
                    <Search className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-2">No results for "{searchQuery}"</h3>
                  <p className="text-sm text-muted-foreground max-w-[280px]">We couldn't find anything matching your search. Try different keywords or adjust your filters.</p>
                  <button onClick={clearFilters} className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm">Clear all filters</button>
                </div>
              ) : (
                <ListingGrid listings={listings} />
              )}
            </div>
          </div>
        ) : (
          /* HOMEPAGE VIEW */
          <div className="space-y-12">
            
            {/* DYNAMIC ADMIN BANNERS */}
            {banners.length > 0 && (
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {banners.map((banner) => (
                  <Link 
                    key={banner.id} 
                    href={banner.cta_url || '/marketplace'} 
                    className="group relative flex h-[180px] w-[90%] sm:w-full shrink-0 snap-center overflow-hidden rounded-3xl bg-card border border-border shadow-sm"
                  >
                    {banner.image_url && (
                      <Image src={banner.image_url} alt={banner.headline} fill className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

                    <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 w-[85%] sm:w-3/4">
                      <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">{banner.headline}</h2>
                      {banner.subtext && <p className="mt-2 text-sm sm:text-base text-zinc-200 line-clamp-2 font-medium drop-shadow-md">{banner.subtext}</p>}
                      
                      <div className="mt-4 flex items-center gap-2 text-primary font-bold text-sm bg-black/30 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {banner.cta_text || 'Shop Now'} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* SELLER PROMO */}
            {userProfile?.role === 'buyer' && (
              <div className="relative w-full overflow-hidden rounded-[2rem] bg-card border border-border shadow-sm">
                <div className="absolute top-[-20%] right-[-10%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 gap-6">
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                       <Sparkles className="h-5 w-5 text-primary" /> Start selling on PrimeMart
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto sm:mx-0">Get your own premium storefront, a custom link, and WhatsApp checkout.</p>
                  </div>
                  <Link href="/seller/paywall" className="shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm">
                    Become a Seller <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* CATEGORIES */}
            {categories.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-5 tracking-tight">Browse Categories</h2>
                <div className="grid grid-cols-4 gap-y-6 gap-x-3">
                  {categories.map((cat) => {
                    const { icon: Icon, color, bg } = getCategoryStyle(cat.name);
                    return (
                      <button key={cat.id} onClick={() => handleCategoryClick(cat.name)} className="flex flex-col items-center gap-2 group">
                        <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl transition-all bg-card border border-border group-hover:border-primary/30 shadow-sm group-hover:shadow-md", bg)}>
                          <Icon className={cn("h-7 w-7", color)} strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] font-bold text-center truncate w-full px-1 text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
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
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2 tracking-tight">
                    <CheckCircle2 className="h-5 w-5 text-primary" /> Verified Sellers
                  </h2>
                  <Link href="/verified-sellers" className="text-sm font-bold text-primary hover:underline">See all</Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {verifiedSellers.map((seller) => {
                    const storeName = seller.seller_profiles?.business_name || seller.name || 'Verified Store';
                    const storeLogo = seller.seller_profiles?.logo_url;
                    const storeSlug = seller.store_slug || seller.seller_code;
                    return (
                      <Link key={seller.id} href={`/store/${storeSlug}`} className="w-[140px] shrink-0 flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-5 text-center hover:border-primary/30 hover:shadow-md transition-all shadow-sm">
                        <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full bg-secondary flex items-center justify-center border-2 border-primary/20 p-0.5">
                          <div className="relative w-full h-full rounded-full overflow-hidden">
                            {storeLogo ? <Image src={storeLogo} alt={storeName} fill className="object-cover" /> : <Store className="h-6 w-6 text-muted-foreground mt-4 ml-4" />}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-1 w-full mb-1">
                          <h3 className="font-bold text-foreground text-[13px] truncate max-w-[90px]">{storeName}</h3>
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate w-full">{seller.seller_profiles?.based_city || 'Top Seller'}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AUTO-SCROLL ROWS */}
            {loading ? (
              <div className="space-y-8"><SkeletonGrid count={4} /></div>
            ) : (
              <>
                {recommended.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">Recommended for you</h2>
                    <AutoScrollRow items={recommended} />
                  </div>
                )}

                {Object.entries(groupedListings).map(([category, items]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-foreground tracking-tight">Best in {category}</h2>
                      <button onClick={() => handleCategoryClick(category)} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                        See all <ArrowRight className="h-4 w-4" />
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