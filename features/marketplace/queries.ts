// features/marketplace/queries.ts
// All server-side data fetching for the marketplace.

import { createServerSupabase } from '@/lib/supabase';
import type { Banner, Category } from '@/types';
import type {
  MarketplaceListing,
  MarketplaceFilters,
  VerifiedSeller,
  CategoryRow,
  MarketplaceData,
} from './types';

const CARD_FIELDS =
  'id, title, price, currency, price_negotiable, images, created_at, featured_until, category_id';

// ============================================================
// BANNERS
// ============================================================
export async function getActiveBanners(): Promise<Banner[]> {
  const supabase = await createServerSupabase();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('active', true)
    .lte('starts_at', now)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order('priority', { ascending: false })
    .limit(3);

  return (data ?? []) as Banner[];
}

// ============================================================
// CATEGORIES
// ============================================================
export async function getActiveCategories(): Promise<Category[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  return (data ?? []) as Category[];
}

// ============================================================
// FEATURED LISTINGS
// ============================================================
export async function getFeaturedListings(): Promise<MarketplaceListing[]> {
  const supabase = await createServerSupabase();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from('listings')
    .select(CARD_FIELDS)
    .eq('status', 'active')
    .eq('image_moderation_status', 'approved')
    .gt('featured_until', now)
    .order('featured_until', { ascending: false })
    .limit(8);

  return (data ?? []) as MarketplaceListing[];
}

// ============================================================
// VERIFIED SELLERS STRIP
// ============================================================
export async function getVerifiedSellers(): Promise<VerifiedSeller[]> {
  const supabase = await createServerSupabase();

  const { data: sellers } = await supabase
    .from('users')
    .select(
      `id, rating_avg, rating_count,
       seller_profiles!inner(business_name, avatar_url, slug, based_city, based_region)`
    )
    .eq('verification_level', 'verified')
    .eq('seller_status', 'active')
    .eq('account_status', 'active')
    .order('rating_avg', { ascending: false })
    .limit(10);

  if (!sellers || sellers.length === 0) return [];

  // Count listings per seller
  const sellerIds = sellers.map((s) => s.id);
  const { data: counts } = await supabase
    .from('listings')
    .select('seller_id')
    .in('seller_id', sellerIds)
    .eq('status', 'active');

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    countMap.set(row.seller_id, (countMap.get(row.seller_id) ?? 0) + 1);
  }

  return sellers.map((s) => {
    const profile = Array.isArray(s.seller_profiles) ? s.seller_profiles[0] : s.seller_profiles;
    return {
      id: s.id,
      business_name: profile?.business_name ?? 'Seller',
      avatar_url: profile?.avatar_url ?? null,
      slug: profile?.slug ?? null,
      based_city: profile?.based_city ?? null,
      based_region: profile?.based_region ?? null,
      rating_avg: s.rating_avg,
      rating_count: s.rating_count,
      listing_count: countMap.get(s.id) ?? 0,
    };
  });
}

// ============================================================
// CATEGORY ROWS
// ============================================================
export async function getCategoryRows(categories: Category[]): Promise<CategoryRow[]> {
  if (categories.length === 0) return [];
  const supabase = await createServerSupabase();

  const { data: counts } = await supabase
    .from('listings')
    .select('category_id')
    .eq('status', 'active')
    .eq('image_moderation_status', 'approved')
    .in('category_id', categories.map((c) => c.id));

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    if (row.category_id) {
      countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1);
    }
  }

  const eligible = categories.filter((c) => (countMap.get(c.id) ?? 0) >= 4);
  if (eligible.length === 0) return [];

  const rows = await Promise.all(
    eligible.map(async (category) => {
      const { data } = await supabase
        .from('listings')
        .select(CARD_FIELDS)
        .eq('status', 'active')
        .eq('image_moderation_status', 'approved')
        .eq('category_id', category.id)
        .order('created_at', { ascending: false })
        .limit(8);

      return {
        category,
        listings: (data ?? []) as MarketplaceListing[],
      };
    })
  );

  return rows.filter((r) => r.listings.length > 0);
}

// ============================================================
// MAIN LISTINGS QUERY (search + filters)
// ============================================================
export async function getListings(
  filters: MarketplaceFilters
): Promise<{ listings: MarketplaceListing[]; totalCount: number }> {
  const supabase = await createServerSupabase();
  const page = filters.page ?? 1;
  const pageSize = 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('listings')
    .select(CARD_FIELDS, { count: 'exact' })
    .eq('status', 'active')
    .eq('image_moderation_status', 'approved');

  if (filters.q) {
    const normalized = filters.q.toLowerCase().trim();
    query = query.or(
      `title_normalized.ilike.%${normalized}%,tags.cs.{${normalized}}`
    );
  }

  if (filters.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.category)
      .maybeSingle();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice);
  if (filters.location) query = query.ilike('location', `%${filters.location}%`);

  switch (filters.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'best_rated':
      // Best rated requires joining seller — fallback to newest
      query = query.order('created_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, count } = await query.range(from, to);

  return {
    listings: (data ?? []) as MarketplaceListing[],
    totalCount: count ?? 0,
  };
}

// ============================================================
// FULL MARKETPLACE DATA
// ============================================================
export async function getMarketplaceData(
  filters: MarketplaceFilters
): Promise<MarketplaceData> {
  const [banners, categories, featured, verifiedSellers] = await Promise.all([
    getActiveBanners(),
    getActiveCategories(),
    getFeaturedListings(),
    getVerifiedSellers(),
  ]);

  const categoryRows = await getCategoryRows(categories);
  const { listings, totalCount } = await getListings(filters);

  return {
    banners,
    categories,
    featured,
    verifiedSellers,
    categoryRows,
    listings,
    totalCount,
  };
}