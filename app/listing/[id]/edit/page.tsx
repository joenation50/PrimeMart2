// app/listings/[id]/edit/page.tsx
import { requireAuth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase';
import { ListingForm } from '@/features/seller/listing-form/ListingForm';

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const session = await requireAuth();
  
  if (session.profile.seller_status !== 'active') {
    redirect('/paywall');
  }
  
  const supabase = await createServerSupabase();
  
  // Fetch the listing (RLS ensures they can only edit their own)
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .eq('seller_id', session.profile.id)
    .single();
  
  if (!listing) notFound();
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Edit Listing</h1>
      <ListingForm 
        categories={categories || []} 
        initialData={listing} 
        isEdit={true} 
        listingId={listing.id} 
      />
    </div>
  );
}