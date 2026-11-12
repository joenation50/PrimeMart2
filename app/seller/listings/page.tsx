'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Edit, Trash2, Eye, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';

export default function SellerListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchListings() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setListings(data || []);
      }
      setLoading(false);
    }
    fetchListings();
  }, [router]);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    const supabase = createBrowserSupabase();
    const { error } = await supabase.from('listings').delete().eq('id', id);

    if (error) {
      alert('Failed to delete listing: ' + error.message);
    } else {
      setListings(prev => prev.filter(l => l.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 pb-32">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
        <Link
          href="/seller/listings/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> New Listing
        </Link>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-muted-foreground mb-4">You haven't created any listings yet.</p>
          <Link
            href="/seller/listings/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Create your first listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="glass-card rounded-2xl p-4 flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-secondary">
                {listing.images?.[0] ? (
                  <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">No Image</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{listing.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {listing.price_negotiable ? 'Negotiable' : formatPrice(listing.price, listing.currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">Status: {listing.status}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/listing/${listing.id}`}
                  className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="View public page"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <Link
                  href={`/seller/listings/${listing.id}/edit`}
                  className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit listing"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(listing.id)}
                  className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                  title="Delete listing"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}