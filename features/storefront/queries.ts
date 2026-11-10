// features/storefront/queries.ts
import { createServerSupabase } from '@/lib/supabase';
import type { StorefrontData } from './types';

export async function getStorefrontData(id: string): Promise < StorefrontData | null > {
  const supabase = await createServerSupabase();
  
  const { data: user } = await supabase
  .from('users')
  .select(`
      id, verification_level, rating_avg, rating_count, last_active_at, created_at,
      seller_profiles!inner(*)
    `)
  .eq('id', id)
  .eq('role', 'seller')
  .single();
  
  if (!user) return null;
  
  const profile = Array.isArray(user.seller_profiles) ? user.seller_profiles[0] : user.seller_profiles;
  
  const { data: listings } = await supabase
  .from('listings')
  .select('*')
  .eq('seller_id', id)
  .eq('status', 'active')
  .eq('image_moderation_status', 'approved')
  .order('created_at', { ascending: false });
  
  return {
    seller: user,
    profile,
    listings: listings || [],
  };
}