import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import StoreClient from './StoreClient';

// Initialize Supabase securely for the server side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const slug = params.slug;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    let query = supabase
      .from('users')
      .select('store_slug, seller_code, name, seller_profiles(business_name, bio, logo_url)');

    if (isUUID) {
      query = query.or(`id.eq.${slug},store_slug.eq.${slug},seller_code.eq.${slug}`);
    } else {
      query = query.or(`store_slug.eq.${slug},seller_code.eq.${slug}`);
    }

    const { data: store } = await query.maybeSingle();

    if (!store) return { title: 'Store Not Found | PrimeMart' };

    const profile = Array.isArray(store.seller_profiles) ? store.seller_profiles[0] : store.seller_profiles;
    const storeName = profile?.business_name || store.name || 'PrimeMart Store';
    const bio = profile?.bio || 'Shop verified items on PrimeMart.';
    const logo = profile?.logo_url || '';
    const storeLink = `primemartapp.name.ng/store/${store.store_slug || store.seller_code}`;

    const ogImageUrl = `/api/og?title=${encodeURIComponent(storeName)}&subtitle=${encodeURIComponent(bio)}&image=${encodeURIComponent(logo)}&link=${encodeURIComponent(storeLink)}`;

    return {
      title: `${storeName} | PrimeMart`,
      description: bio,
      openGraph: {
        title: storeName,
        description: bio,
        images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: storeName,
        description: bio,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    return { title: 'PrimeMart Store' };
  }
}

export default function StorePage() {
  return <StoreClient />;
}