// app/seller/[id]/page.tsx
import { StorefrontPage } from '@/features/storefront/StorefrontPage';
import { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: { id: string } }): Promise < Metadata > {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from('seller_profiles').select('business_name, bio').eq('user_id', params.id).single();
  if (!data) return { title: 'Seller not found' };
  return {
    title: `${data.business_name} · PrimeMart`,
    description: data.bio || `Shop from ${data.business_name} on PrimeMart.`,
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <StorefrontPage id={params.id} />;
}