'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Edit, Trash2, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function SellerListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;
    
    setActionLoading(id);
    const supabase = createBrowserSupabase();
    const { error } = await supabase.from('listings').delete().eq('id', id);

    if (error) {
      alert('Failed to delete listing: ' + error.message);
    } else {
      setListings(prev => prev.filter(l => l.id !== id));
    }
    setActionLoading(null);
  }

  // NEW: Toggle Sold/Active Status
  async function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'sold' : 'active';
    
    if (newStatus === 'active') {
       // Check if they have reached the limit before reactivating
       const activeCount = listings.filter(l => l.status === 'active').length;
       if (activeCount >= 20) {
         alert("You have reached your limit of 20 active listings. Please mark another item as sold before reactivating this one.");
         return;
       }
    }

    setActionLoading(id);
    const supabase = createBrowserSupabase();
    
    const { error } = await supabase.from('listings').update({ status: newStatus }).eq('id', id);

    if (error) {
      alert('Failed to update status: ' + error.message);
    } else {
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    }
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeCount = listings.filter(l => l.status === 'active').length;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 pb-32">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
        <Link
          href="/seller/listings/new"
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity",
            activeCount >= 20 ? "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none" : "bg-primary text-primary-foreground hover:opacity-90"
          )}
        >
          <Plus className="h-4 w-4" /> New Listing
        </Link>
      </div>
      
      <p className="text-sm text-muted-foreground mb-8">
        You are using <span className="font-bold text-foreground">{activeCount}</span> out of 20 active listing slots.
      </p>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-muted-foreground mb-4">You haven't created any listings yet.</p>
          <Link href="/seller/listings/new" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> Create your first listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className={cn("glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-opacity", listing.status !== 'active' && 'opacity-60 grayscale-[50%]')}>
              
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
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                    listing.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                  )}>
                    {listing.status}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                {/* Mark as Sold / Reactivate */}
                <button
                  onClick={() => handleToggleStatus(listing.id, listing.status)}
                  disabled={actionLoading === listing.id}
                  className={cn(
                    "flex-1 sm:flex-none justify-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5",
                    listing.status === 'active' 
                      ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" 
                      : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                  )}
                >
                  {actionLoading === listing.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  {listing.status === 'active' ? 'Mark as Sold' : 'Reactivate'}
                </button>

                <Link
                  href={`/listing/${listing.id}`}
                  target="_blank"
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="View public page"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                
                <Link
                  href={`/seller/listings/${listing.id}/edit`}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit listing"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                
                <button
                  onClick={() => handleDelete(listing.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
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