import type { Listing, SellerProfile, Review } from '@/types';

export interface FullListing extends Listing {
  seller: any; 
  seller_profile: SellerProfile;
  category?: any; // <-- Changed this line
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