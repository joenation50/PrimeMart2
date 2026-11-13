'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { 
  Search, ArrowLeft, CheckCircle2, Loader2, Store
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function VerifiedSellersPage() {
  const router = useRouter();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchVerifiedSellers() {
      const supabase = createBrowserSupabase();
      
      // Fetch only verified sellers
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, name, store_slug, seller_code, verification_level,
          seller_profiles(business_name, logo_url, based_city, bio)
        `)
        .eq('verification_level', 'verified')
        .eq('role', 'seller')
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMsg(error.message);
      } else if (data) {
        setSellers(data);
      }
      setLoading(false);
    }
    
    fetchVerifiedSellers();
  }, []);

  // Filter sellers based on the search input
  const filteredSellers = sellers.filter((seller) => {
    const query = searchQuery.toLowerCase();
    const businessName = (seller.seller_profiles?.business_name || seller.name || '').toLowerCase();
    const city = (seller.seller_profiles?.based_city || '').toLowerCase();
    const bio = (seller.seller_profiles?.bio || '').toLowerCase();
    
    return businessName.includes(query) || city.includes(query) || bio.includes(query);
  });

  return (
    <div className="min-h-screen bg-background pb-32">
      
      {/* 1. GRADIENT HEADER */}
      <div className="relative bg-gradient-to-br from-primary to-emerald-900 pt-12 pb-24 px-4 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => router.back()} 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Verified Sellers</h1>
        </div>
        <p className="text-white/80 text-sm ml-14">
          Shop safely from trusted PrimeMart entrepreneurs.
        </p>
      </div>

      {/* 2. OVERLAPPING SEARCH BAR */}
      <div className="px-4 -mt-8 relative z-10 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          <input 
            type="text" 
            placeholder="Search brands, categories..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full rounded-2xl border border-border bg-card pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary shadow-lg" 
          />
        </div>
      </div>

      {/* 3. SELLERS GRID */}
      <div className="px-4">
        {errorMsg && (
          <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-500">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Store className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-foreground mb-2">No verified sellers found</h2>
            <p className="text-muted-foreground text-sm">
              {searchQuery ? `No results for "${searchQuery}"` : 'Check back later for trusted vendors.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredSellers.map((seller) => {
              const profile = seller.seller_profiles;
              const storeName = profile?.business_name || seller.name || 'Verified Store';
              const storeLogo = profile?.logo_url;
              const storeSlug = seller.store_slug || seller.seller_code;
              
              // Use city if available, otherwise fallback to a snippet of their bio
              const subtitle = profile?.based_city || profile?.bio || 'Trusted Seller';

              return (
                <Link 
                  key={seller.id} 
                  href={`/store/${storeSlug}`}
                  className="group flex flex-col items-center justify-center rounded-3xl bg-card border border-border p-6 text-center shadow-sm transition-all hover:bg-secondary/30 hover:-translate-y-1"
                >
                  {/* Logo */}
                  <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm flex items-center justify-center">
                    {storeLogo ? (
                      <Image 
                        src={storeLogo} 
                        alt={storeName} 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {storeName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Name & Badge */}
                  <div className="flex items-center justify-center gap-1.5 mb-1 w-full">
                    <h3 className="font-bold text-foreground text-sm uppercase truncate max-w-[110px]">
                      {storeName}
                    </h3>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary fill-primary/20" />
                  </div>

                  {/* Subtitle (City or Bio) */}
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase truncate w-full px-2">
                    {subtitle}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}