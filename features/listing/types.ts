import type { Listing, SellerProfile, Review } from '@/types';

export interface FullListing extends Listing {
  seller: any; // Matches the 'any' type in the base Listing interface
  seller_profile: SellerProfile;
  category?: { name: string; slug: string };
  reviews_preview?: Review[];
  is_favorited?: boolean;
}

export interface TeaserListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  price_negotiable: boolean;
  images: string[];
  location: string | null;
  seller_name: string;
  seller_verified: boolean;
  seller_rating: number;
  created_at: string;
}