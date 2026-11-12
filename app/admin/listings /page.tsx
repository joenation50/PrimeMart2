'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    const supabase = createBrowserSupabase();
    const { data } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    setListings(data || []);
    setLoading(false);
  }

  async function deleteListing(id: string) {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    const supabase = createBrowserSupabase();
    await supabase.from('listings').update({ status: 'deleted' }).eq('id', id);
    setListings(listings.filter(l => l.id !== id));
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Marketplace Listings</h1>
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Listing</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-secondary/20">
                  <td className="px-6 py-4 flex items-center gap-3">
                    {l.images?.[0] && (
                      <img src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_50,h_50,c_fill/${l.images[0]}`} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <span className="font-medium text-foreground max-w-[200px] truncate">{l.title}</span>
                  </td>
                  <td className="px-6 py-4">{formatPrice(l.price, l.currency)}</td>
                  <td className="px-6 py-4 capitalize">{l.status}</td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <Link href={`/listing/${l.id}`} target="_blank" className="p-2 text-muted-foreground hover:bg-secondary rounded-lg">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <button onClick={() => deleteListing(l.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}