'use client';

import { use, useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, Store as StoreIcon, ShieldCheck } from 'lucide-react';
import { ListingGrid } from '@/features/marketplace/grid';

export default function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [loading, setLoading] = useState(true);
  const [storeOwner, setStoreOwner] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStore() {
      const supabase = createBrowserSupabase();

      // Look up by the new store_slug, OR the old seller_code (as a fallback)
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, store_slug, seller_code, verification_level, seller_profiles(business_name)')
        .or(`store_slug.eq.${slug},seller_code.eq.${slug}`)
        .single();

      if (userError || !user) {
        setLoading(false);
        return;
      }

      setStoreOwner(user);

      const { data: storeListings } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (storeListings) setListings(storeListings);
      setLoading(false);
    }

    if (slug) fetchStore();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!storeOwner) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center">
        <StoreIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Store Not Found</h1>
        <p className="text-muted-foreground">The store "{slug}" does not exist.</p>
      </div>
    );
  }

  const storeName = storeOwner.seller_profiles?.business_name || storeOwner.name || 'Seller Store';
  const isVerified = storeOwner.verification_level === 'verified';

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="bg-primary/5 border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4 flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold mb-4 shadow-xl">
            {storeName.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
            {storeName}
            {isVerified && <ShieldCheck className="h-6 w-6 text-primary" />}
          </h1>
          <p className="mt-2 text-muted-foreground">Welcome to my store on PrimeMart.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-xl font-bold mb-6">Products from this Seller</h2>
        {listings.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-3xl">
            <p className="text-muted-foreground">This seller hasn't listed any products yet.</p>
          </div>
        ) : (
          <ListingGrid listings={listings} showFavorites={true} />
        )}
      </div>
    </div>
  );
}