// app/listing/[id]/page.tsx
import { ListingDetailPage } from '@/features/listing/ListingDetailPage';
import { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: { id: string } }): Promise < Metadata > {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from('listings').select('title, price').eq('id', params.id).single();
  
  if (!data) return { title: 'Listing not found' };
  return {
    title: `${data.title} · PrimeMart`,
    description: `Buy ${data.title} for ₦${data.price.toLocaleString()} on PrimeMart.`,
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <ListingDetailPage id={params.id} />;
}