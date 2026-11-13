'use client';

import { use, useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, Store as StoreIcon, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { ListingGrid } from '@/features/marketplace/grid';
import Image from 'next/image';
import Link from 'next/link';

export default function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [loading, setLoading] = useState(true);
  const [storeOwner, setStoreOwner] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [debugError, setDebugError] = useState<string | null>(null); // <-- NEW

  useEffect(() => {
    async function fetchStore() {
      const supabase = createBrowserSupabase();

      // Fetch User
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, store_slug, seller_code, verification_level, seller_profiles(business_name, logo_url)')
        .or(`store_slug.eq.${slug},seller_code.eq.${slug}`)
        .maybeSingle();

      if (userError) {
        setDebugError(`Database Error: ${userError.message}`);
        setLoading(false);
        return;
      }

      if (!user) {
        setDebugError(`Store Not Found: The slug "${slug}" does not exist in the database.`);
        setLoading(false);
        return;
      }

      setStoreOwner(user);

      // Fetch Listings
      const { data: storeListings, error: listError } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (listError) {
        setDebugError(`Listings Error: ${listError.message}`);
      } else {
        setListings(storeListings || []);
      }
      
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

  // SHOW THE ERROR ON SCREEN IF THERE IS ONE
  if (debugError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Store Error</h1>
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl max-w-lg mb-6">
          <p className="font-mono text-sm break-words">{debugError}</p>
        </div>
        <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>
      </div>
    );
  }

  if (!storeOwner) return null;

  const storeName = storeOwner.seller_profiles?.business_name || storeOwner.name || 'Seller Store';
  const storeLogo = storeOwner.seller_profiles?.logo_url;
  const isVerified = storeOwner.verification_level === 'verified';

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="bg-primary/5 border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4 flex flex-col items-center text-center">
          <div className="relative h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold mb-4 shadow-xl overflow-hidden">
            {storeLogo ? (
              <Image src={storeLogo} alt={storeName} fill className="object-cover" />
            ) : (
              storeName.charAt(0).toUpperCase()
            )}
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