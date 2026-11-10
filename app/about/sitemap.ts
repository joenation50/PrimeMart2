// app/sitemap.ts
import { MetadataRoute } from 'next';
import { createServerSupabase } from '@/lib/supabase';

export default async function sitemap(): Promise < MetadataRoute.Sitemap > {
  const supabase = await createServerSupabase();
  
  // Get active listings
  const { data: listings } = await supabase
  .from('listings')
  .select('id, updated_at')
  .eq('status', 'active')
  .limit(1000);
  
  const listingUrls = (listings || []).map((listing) => ({
    url: `https://primemart.com/listing/${listing.id}`,
    lastModified: new Date(listing.updated_at),
  }));
  
  return [
    { url: 'https://primemart.com', lastModified: new Date() },
    { url: 'https://primemart.com/about', lastModified: new Date() },
    ...listingUrls,
  ];
}