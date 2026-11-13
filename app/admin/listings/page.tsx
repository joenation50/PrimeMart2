'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Trash2, ExternalLink, Loader2, AlertCircle, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';

export default function AdminAllListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    const supabase = createBrowserSupabase();
    
    // Fetch listings and join the seller's name for context
    const { data, error } = await supabase
      .from('listings')
      .select(`*, users(name, email)`)
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  }

  async function deleteListing(id: string) {
    if (!confirm('Are you sure you want to remove this listing from the platform?')) return;
    
    const supabase = createBrowserSupabase();
    // Soft delete: just change the status so it disappears from the marketplace
    const { error } = await supabase.from('listings').update({ status: 'deleted' }).eq('id', id);
    
    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      setListings(listings.map(l => l.id === id ? { ...l, status: 'deleted' } : l));
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">All Platform Listings</h1>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">Database Error: {errorMsg}</p>
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Listing</th>
                <th className="px-6 py-4 font-semibold">Seller</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-secondary/20">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                      {l.images?.[0] ? (
                        <Image src={l.images[0]} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                      )}
                    </div>
                    <span className="font-medium text-foreground max-w-[200px] truncate">{l.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{l.users?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{l.users?.email}</p>
                  </td>
                  <td className="px-6 py-4">{formatPrice(l.price, l.currency)}</td>
                  <td className="px-6 py-4 capitalize">
                    <span className={l.status === 'active' ? 'text-green-500' : 'text-red-500'}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <Link href={`/listing/${l.id}`} target="_blank" className="p-2 text-muted-foreground hover:bg-secondary rounded-lg" title="View">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    {l.status !== 'deleted' && (
                      <button onClick={() => deleteListing(l.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg" title="Remove from platform">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No listings found on the platform.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}