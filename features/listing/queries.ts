import { createServerSupabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import type { FullListing, TeaserListing } from './types';

export async function getListingData(id: string): Promise<{
  full: FullListing | null;
  teaser: TeaserListing | null;
  isLoggedIn: boolean;
  isFavorited: boolean;
}> {
  const supabase = await createServerSupabase();
  const session = await getSession();

  const { data: listing } = await supabase
    .from('listings')
    .select(`
      *,
      seller:seller_id(id, name, phone, rating_avg, rating_count, verification_level, last_active_at, store_slug, seller_code),
      seller_profile:seller_id(business_name, avatar_url, based_city, based_region),
      category:category_id(name, slug)
    `)
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (!listing) return { full: null, teaser: null, isLoggedIn: !!session, isFavorited: false };

  const sellerProfile = Array.isArray(listing.seller_profile) ? listing.seller_profile[0] : listing.seller_profile;
  const seller = Array.isArray(listing.seller) ? listing.seller[0] : listing.seller;

  // Added store_slug and seller_code to teaser so guests can visit the store
  const teaser: TeaserListing = {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    currency: listing.currency,
    price_negotiable: listing.price_negotiable,
    images: listing.images,
    location: listing.location,
    seller_name: sellerProfile?.business_name ?? 'Seller',
    seller_verified: seller?.verification_level === 'verified',
    seller_rating: seller?.rating_avg ?? 0,
    seller_slug: seller?.store_slug || seller?.seller_code || null,
    created_at: listing.created_at,
  };

  if (!session) {
    return { full: null, teaser, isLoggedIn: false, isFavorited: false };
  }

  const { data: fav } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', session.profile.id)
    .eq('listing_id', id)
    .maybeSingle();

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, buyer:buyer_id(id, name)')
    .eq('seller_id', listing.seller_id)
    .eq('status', 'visible')
    .order('created_at', { ascending: false })
    .limit(3);

  const full: FullListing = {
    ...listing,
    seller: seller,
    seller_profile: sellerProfile,
    reviews_preview: reviews ?? [],
    is_favorited: !!fav,
  };

  return { full, teaser, isLoggedIn: true, isFavorited: !!fav };
}