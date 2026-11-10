// app/listings/new/page.tsx
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ListingForm } from '@/features/seller/listing-form/ListingForm';
import { createServerSupabase } from '@/lib/supabase';

export const metadata = {
  title: 'Create Listing · PrimeMart',
};

export default async function NewListingPage() {
  const session = await requireAuth();
  
  // Kicks them out if they haven't paid
  if (session.profile.seller_status === 'unpaid' || session.profile.seller_status === 'pending') {
    redirect('/paywall');
  }
  
  const supabase = await createServerSupabase();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Create a Listing</h1>
      <ListingForm categories={categories || []} />
    </div>
  );
}