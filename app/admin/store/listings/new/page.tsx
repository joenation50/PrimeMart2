'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { ListingForm } from '@/features/seller/listing-form/ListingForm';
import { Loader2 } from 'lucide-react';

export default function AdminNewListingPage() {
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
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Add New Product to My Store</h1>
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <ListingForm categories={categories} />
      </div>
    </div>
  );
}