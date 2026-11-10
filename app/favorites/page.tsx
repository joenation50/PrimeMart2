// app/favorites/page.tsx
import { requireAuth } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { ListingCard } from '@/features/marketplace/grid';

export const metadata = {
  title: 'Saved Listings · PrimeMart',
};

export default async function FavoritesPage() {
  const session = await requireAuth();
  const supabase = await createServerSupabase();
  
  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      listing_id,
      listings!inner(
        id, title, price, currency, price_negotiable, images, created_at, featured_until, category_id, status
      )
    `)
    .eq('user_id', session.profile.id)
    .order('created_at', { ascending: false });
  
  // Filter out deleted or hidden listings
  const validFavorites = favorites?.filter(
    (f: any) => f.listings.status === 'active'
  ) || [];
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Saved Listings</h1>
      
      {validFavorites.length === 0 ? (
        <div className="rounded-xl border border-border py-16 text-center">
          <p className="text-lg font-medium">No saved listings yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the heart icon on any listing to save it for later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {validFavorites.map((fav: any) => (
            <ListingCard key={fav.listing_id} listing={fav.listings} isFavorited={true} showFavorite={true} />
          ))}
        </div>
      )}
    </div>
  );
}