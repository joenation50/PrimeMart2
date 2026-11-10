// features/storefront/types.ts
import type { User, SellerProfile, Listing } from '@/types';

export interface StorefrontData {
  seller: Pick<User, 'id' | 'verification_level' | 'rating_avg' | 'rating_count' | 'last_active_at' | 'created_at'>;
  profile: SellerProfile;
  listings: Listing[];
}