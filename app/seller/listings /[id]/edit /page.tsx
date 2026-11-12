'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter, useParams } from 'next/navigation';
import { ListingForm } from '@/features/seller/listing-form/ListingForm';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SellerEditListingPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: catData } = await supabase.from('categories').select('*').eq('active', true).order('sort_order');
      const { data: listingData } = await supabase.from('listings').select('*').eq('id', params.id).eq('seller_id', user.id).single();

      if (!listingData) { router.push('/seller'); return; }

      setCategories(catData || []);
      setListing(listingData);
      setLoading(false);
    }
    loadData();
  }, [params.id, router]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 pb-32">
      <Link href="/seller" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
      <h1 className="mb-8 text-3xl font-bold text-foreground">Edit Listing</h1>
      <ListingForm categories={categories} initialData={listing} isEdit={true} listingId={listing.id} />
    </div>
  );
}