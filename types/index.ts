// types/index.ts

export type UserRole = 'buyer' | 'seller' | 'admin';
export type SellerStatus = 'unpaid' | 'pending' | 'active' | 'lapsed';
export type AccountStatus = 'active' | 'suspended' | 'banned' | 'deleted';
export type VerificationLevel = 'none' | 'phone' | 'verified';
export type AuthMethod = 'email' | 'google';
export type ListingStatus = 'active' | 'hidden' | 'sold' | 'deleted';
export type PaymentStatus = 'pending_review' | 'approved' | 'rejected';
export type PaymentType = 'subscription' | 'renewal' | 'featured';
export type ReviewStatus = 'visible' | 'hidden';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportTargetType = 'listing' | 'seller' | 'buyer' | 'review';

export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  auth_method: AuthMethod;
  country: string;
  country_locked: boolean;
  timezone: string;
  role: UserRole;
  seller_status: SellerStatus | null;
  seller_code: string;
  seller_expires_at: string | null;
  verification_level: VerificationLevel;
  rating_avg: number;
  rating_count: number;
  account_status: AccountStatus;
  notification_preferences: { email: boolean; in_app: boolean };
  last_active_at: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SellerProfile {
  user_id: string;
  real_name: string;
  business_name: string;
  avatar_url: string | null;
  bio: string | null;
  based_country: string;
  based_region: string | null;
  based_city: string | null;
  lat: number | null;
  lng: number | null;
  delivers_to_countries: string[];
  delivers_to_regions: string[];
  delivers_worldwide: boolean;
  pickup_available: boolean;
  delivery_notes: string | null;
  delivery_fee_note: string | null;
  social_instagram: string | null;
  social_tiktok: string | null;
  social_x: string | null;
  primary_categories: string[];
  pinned_listing_id: string | null;
  slug: string | null;
  away_mode: boolean;
  profile_completeness: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  title_normalized: string;
  tags: string[];
  description: string | null;
  price: number;
  currency: string;
  price_negotiable: boolean;
  category_id: string | null;
  location: string | null;
  images: string[];
  image_moderation_status: 'pending' | 'approved' | 'flagged' | 'rejected';
  status: ListingStatus;
  featured_until: string | null;
  last_confirmed_at: string;
  view_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  // Changed to 'any' to allow our custom joined types without complaining
  seller?: any; 
  seller_profile?: SellerProfile;
  category?: Category;
}

export interface ListingCard {
  id: string;
  title: string;
  price: number;
  currency: string;
  price_negotiable: boolean;
  images: string[];
  created_at: string;
  featured_until: string | null;
}

export interface Payment {
  id: string;
  seller_id: string;
  reference: string;
  amount: number;
  currency: string;
  screenshot_url: string;
  claimed_ref: string | null;
  payment_type: PaymentType;
  status: PaymentStatus;
  reject_reason: string | null;
  submitted_at: string;
  approved_at: string | null;
  expires_at: string | null;
  reviewed_by: string | null;
}

export interface Review {
  id: string;
  seller_id: string;
  buyer_id: string;
  rating: number;
  text: string | null;
  status: ReviewStatus;
  hidden_reason: string | null;
  hidden_by: string | null;
  hidden_at: string | null;
  seller_reply: string | null;
  seller_replied_at: string | null;
  created_at: string;
  updated_at: string;
  buyer?: Pick<User, 'id' | 'name'>;
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter_role: 'buyer' | 'seller';
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Banner {
  id: string;
  type: 'announcement' | 'ad' | 'promo' | 'seasonal';
  image_url: string;
  headline: string;
  subtext: string | null;
  cta_text: string | null;
  cta_url: string | null;
  target_audience: string;
  priority: number;
  dismissible: boolean;
  starts_at: string;
  ends_at: string | null;
  active: boolean;
  impressions: number;
  clicks: number;
  created_by: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  admin_id: string | null;
  target_type: string;
  target_id: string | null;
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  created_at: string;
}