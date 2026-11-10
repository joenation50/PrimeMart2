// features/marketplace/types.ts
import type { Listing, Category, Banner } from '@/types';

export interface MarketplaceListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  price_negotiable: boolean;
  images: string[];
  created_at: string;
  featured_until: string | null;
  category_id: string | null;
}

export interface VerifiedSeller {
  id: string;
  business_name: string;
  avatar_url: string | null;
  slug: string | null;
  based_city: string | null;
  based_region: string | null;
  rating_avg: number;
  rating_count: number;
  listing_count: number;
}

export interface CategoryRow {
  category: Category;
  listings: MarketplaceListing[];
}

export interface MarketplaceFilters {
  q ? : string;
  category ? : string;
  minPrice ? : number;
  maxPrice ? : number;
  location ? : string;
  deliversTo ? : string;
  pickupOnly ? : boolean;
  verifiedOnly ? : boolean;
  minRating ? : number;
  sort ? : 'newest' | 'price_asc' | 'price_desc' | 'best_rated';
  page ? : number;
}

export interface MarketplaceData {
  banners: Banner[];
  featured: MarketplaceListing[];
  verifiedSellers: VerifiedSeller[];
  categoryRows: CategoryRow[];
  listings: MarketplaceListing[];
  totalCount: number;
  categories: Category[];
}

export interface SearchSuggestion {
  type: 'category' | 'title' | 'business';
  text: string;
  slug ? : string;
}