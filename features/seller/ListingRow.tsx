'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, MessageCircle, MoreHorizontal, Edit, Trash2, CheckCircle, EyeOff } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { deleteListing, markListingSold, hideListing } from '@/actions/listings';
import type { Listing } from '@/types';

export function ListingRow({ listing }: { listing: Listing }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState(listing.status);
  
  const image = listing.images?.[0];

  async function handleAction(action: () => Promise<any>) {
    setMenuOpen(false);
    await action();
    if (action === markListingSold) setStatus('sold');
    if (action === hideListing) setStatus('hidden');
    if (action === deleteListing) setStatus('deleted');
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-secondary/20 transition-colors">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted border border-border">
          {image ? (
            <Image
              src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_200,h_200,c_fill,q_auto,f_auto/${image}`}
              alt={listing.title}
              fill
              className="object-cover"
            />
          ) : null}
        </div>
        <div>
          <p className="font-semibold text-foreground line-clamp-1">{listing.title}</p>
          <p className="text-sm font-medium text-primary">{formatPrice(listing.price, listing.currency)}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {listing.view_count}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {listing.click_count}</span>
            {status !== 'active' && (
              <span className="rounded-full bg-secondary px-2 py-0.5 font-bold uppercase tracking-wider text-[10px]">{status}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* UPDATED LINK HERE */}
        <Link
          href={`/seller/listings/${listing.id}/edit`}
          className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-secondary transition-colors"
        >
          <Edit className="h-4 w-4" /> <span className="hidden sm:inline">Edit</span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-border bg-background p-1 shadow-lg">
                <button
                  onClick={() => handleAction(() => markListingSold(listing.id))}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                >
                  <CheckCircle className="h-4 w-4" /> Mark as sold
                </button>
                <button
                  onClick={() => handleAction(() => hideListing(listing.id))}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                >
                  <EyeOff className="h-4 w-4" /> Hide listing
                </button>
                <div className="my-1 h-px bg-border" />
                <button
                  onClick={() => handleAction(() => deleteListing(listing.id))}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}