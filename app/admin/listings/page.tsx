'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Trash2, ExternalLink, Loader2, AlertCircle, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';

export default function AdminAllListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    const supabase = createBrowserSupabase();
    
    // EXPLICIT JOIN: Using the new foreign key constraint we just created
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *, 
        users(name, email), 
        seller_profiles!listings_seller_profile_fkey(business_name)
      `)
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

  // UNIVERSAL SEARCH FOR ADMIN LISTINGS
  const filteredListings = listings.filter(l => {
    const q = searchQuery.toLowerCase();
    return (
      (l.title || '').toLowerCase().includes(q) ||
      (l.category || '').toLowerCase().includes(q) ||
      (l.users?.name || '').toLowerCase().includes(q) ||
      (l.seller_profiles?.business_name || '').toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Platform Listings</h1>
          <p className="text-sm text-muted-foreground">Manage every product across PrimeMart.</p>
        </div>
        
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search title, category, or seller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

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
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredListings.map((l) => (
                <tr key={l.id} className="hover:bg-secondary/20">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                      {l.images?.[0] ? <Image src={l.images[0]} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Img</div>}
                    </div>
                    <span className="font-medium text-foreground max-w-[200px] truncate">{l.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{l.seller_profiles?.business_name || l.users?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{l.users?.email}</p>
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-bold text-muted-foreground">{l.category || 'General'}</td>
                  <td className="px-6 py-4">{formatPrice(l.price, l.currency)}</td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <Link href={`/listing/${l.id}`} target="_blank" className="p-2 text-muted-foreground hover:bg-secondary rounded-lg" title="View public page">
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
              {filteredListings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No listings found matching "{searchQuery}"
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