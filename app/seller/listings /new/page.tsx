'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { ListingForm } from '@/features/seller/listing-form/ListingForm';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SellerNewListingPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createBrowserSupabase();
      const { data } = await supabase.from('categories').select('*').eq('active', true).order('sort_order');
      setCategories(data || []);
      setLoading(false);
    }
    fetchCategories();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 pb-32">
      <Link href="/seller" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
      <h1 className="mb-8 text-3xl font-bold text-foreground">Create a Listing</h1>
      <ListingForm categories={categories} />
    </div>
  );
}