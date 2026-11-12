'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { ListingGrid, SkeletonGrid } from '@/features/marketplace/grid';
import { Heart } from 'lucide-react';

export default function BuyerFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from('favorites').select(`listing_id, listings!inner(*, users(name, verification_level), seller_profiles(business_name))`).eq('user_id', user.id);

      if (data) {
        const validListings = data.map((f: any) => f.listings).filter((l: any) => l.status === 'active');
        setFavorites(validListings);
      }
      setLoading(false);
    }
    loadFavorites();
  }, []);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-16 pb-32 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><Heart className="h-8 w-8 text-primary" /> Saved Items</h1>
        <p className="text-muted-foreground mt-2">Products you've saved for later.</p>
      </div>
      {loading ? <SkeletonGrid count={4} /> : favorites.length === 0 ? (
        <div className="rounded-3xl border border-border glass-card py-24 text-center">
          <p className="text-xl font-medium text-foreground">No saved items yet</p>
          <p className="mt-2 text-muted-foreground">Tap the heart on any product to save it here.</p>
        </div>
      ) : <ListingGrid listings={favorites} showFavorites={true} />}
    </div>
  );
}