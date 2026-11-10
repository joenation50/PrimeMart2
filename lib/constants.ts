// lib/constants.ts

export const SITE_NAME = 'PrimeMart';
export const SITE_TAGLINE = 'Buy and sell on WhatsApp';

export const SELLER_PRICE_NGN = 5000;
export const SELLER_PRICE_USD = 10;
export const SELLER_SUBSCRIPTION_DAYS = 365;

export const PRICE_RANGES = [
  { label: 'Under ₦5,000', min: 0, max: 5000 },
  { label: '₦5,000 – ₦20,000', min: 5000, max: 20000 },
  { label: '₦20,000 – ₦100,000', min: 20000, max: 100000 },
  { label: '₦100,000+', min: 100000, max: null },
] as const;

export const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
  { code: 'GH', name: 'Ghana', currency: 'USD' },
  { code: 'KE', name: 'Kenya', currency: 'USD' },
  { code: 'ZA', name: 'South Africa', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'USD' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'CA', name: 'Canada', currency: 'USD' },
] as const;

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
] as const;

export const REPORT_REASONS = {
  listing: [
    { value: 'scam', label: 'Scam or fraud' },
    { value: 'fake_item', label: 'Fake or counterfeit item' },
    { value: 'wrong_category', label: 'Wrong category' },
    { value: 'offensive', label: 'Offensive content' },
    { value: 'other', label: 'Other' },
  ],
  seller: [
    { value: 'unresponsive', label: 'Unresponsive' },
    { value: 'misleading', label: 'Misleading information' },
    { value: 'scam', label: 'Scam or fraud' },
    { value: 'offensive', label: 'Abusive or offensive' },
    { value: 'other', label: 'Other' },
  ],
  review: [
    { value: 'not_customer', label: 'Not a real customer' },
    { value: 'abusive', label: 'Abusive or offensive' },
    { value: 'wrong_seller', label: 'Wrong seller' },
    { value: 'spam', label: 'Spam' },
    { value: 'false', label: 'Factually false' },
  ],
  buyer: [
    { value: 'abusive', label: 'Abusive or offensive' },
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'other', label: 'Other' },
  ],
} as const;

export const LISTING_MIN_PRICE = 100;
export const LISTING_MAX_PRICE = 50_000_000;
export const LISTING_MAX_IMAGES = 6;
export const LISTING_MAX_TAGS = 5;

export const STALE_LISTING_DAYS = 90;
export const REVIEW_MIN_ACCOUNT_AGE_HOURS = 24;
export const MAX_REVIEWS_PER_WEEK = 3;