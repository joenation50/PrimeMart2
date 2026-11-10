// features/listing/queries.ts
// THIS IS WHERE THE GATE LIVES.
import { createServerSupabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import type { FullListing, TeaserListing } from './types';

export async function getListingData(id: string): Promise < {
  full: FullListing | null;
  teaser: TeaserListing | null;
  isLoggedIn: boolean;
  isFavorited: boolean;
} > {
  const supabase = await createServerSupabase();
  const session = await getSession();
  
  // 1. Fetch base data with seller profile
  const { data: listing } = await supabase
  .from('listings')
  .select(`
      *,
      seller:seller_id(id, name, phone, rating_avg, rating_count, verification_level, last_active_at),
      seller_profile:seller_id(business_name, avatar_url, based_city, based_region, delivers_to_countries, delivers_to_regions, delivers_worldwide, pickup_available),
      category:category_id(name, slug)
    `)
  .eq('id', id)
  .eq('status', 'active')
  .eq('image_moderation_status', 'approved')
  .single();
  
  if (!listing) return { full: null, teaser: null, isLoggedIn: !!session, isFavorited: false };
  
  // 2. Build Teaser (safe for logged-out users)
  const sellerProfile = Array.isArray(listing.seller_profile) ? listing.seller_profile[0] : listing.seller_profile;
  const seller = Array.isArray(listing.seller) ? listing.seller[0] : listing.seller;
  
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
    created_at: listing.created_at,
  };
  
  // 3. If not logged in, return ONLY the teaser. No phone number, no description.
  if (!session) {
    return { full: null, teaser, isLoggedIn: false, isFavorited: false };
  }
  
  // 4. Logged in: Check if favorited
  const { data: fav } = await supabase
  .from('favorites')
  .select('id')
  .eq('user_id', session.profile.id)
  .eq('listing_id', id)
  .maybeSingle();
  
  // 5. Logged in: Fetch recent reviews (max 3)
  const { data: reviews } = await supabase
  .from('reviews')
  .select('*, buyer:buyer_id(id, name)')
  .eq('seller_id', listing.seller_id)
  .eq('status', 'visible')
  .order('created_at', { ascending: false })
  .limit(3);
  
  // 6. Build full object (now safe to include description and phone)
  const full: FullListing = {
    ...listing,
    seller,
    seller_profile: sellerProfile,
    reviews_preview: reviews ?? [],
    is_favorited: !!fav,
  };
  
  return { full, teaser, isLoggedIn: true, isFavorited: !!fav };
}