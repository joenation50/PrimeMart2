import { MetadataRoute } from 'next';
import { createServerSupabase } from '@/lib/supabase';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = await createServerSupabase();
    
    // Get active listings
    const { data: listings } = await supabase
      .from('listings')
      .select('id, updated_at')
      .eq('status', 'active')
      .limit(1000);

    const baseUrl = env.siteUrl; // <-- Pulls from your Cloudflare Environment Variable

    const listingUrls = (listings || []).map((listing) => ({
      url: `${baseUrl}/listing/${listing.id}`,
      lastModified: new Date(listing.updated_at),
    }));

    return [
      { url: baseUrl, lastModified: new Date() },
      { url: `${baseUrl}/about`, lastModified: new Date() },
      ...listingUrls,
    ];
  } catch (error) {
    const baseUrl = env.siteUrl;
    return [
      { url: baseUrl, lastModified: new Date() },
      { url: `${baseUrl}/about`, lastModified: new Date() },
    ];
  }
}