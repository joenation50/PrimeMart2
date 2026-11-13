'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Package } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export function ListingCard({ listing }: { listing: any }) {
  const [imgError, setImgError] = useState(false);
  
  const rawImage = listing.images?.[0];
  const primaryImage = rawImage && rawImage.startsWith('http') ? rawImage : null;

  return (
    <Link 
      href={`/listing/${listing.id}`} 
      className="group block w-[140px] shrink-0 sm:w-[160px]"
    >
      <div className="rounded-2xl bg-card p-2 pb-3 shadow-sm border border-border transition-transform hover:-translate-y-1">
        
        {/* IMAGE */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {primaryImage && !imgError ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 140px, 160px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Package className="h-6 w-6 mb-1 opacity-50" />
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="mt-2 px-1">
          <p className="text-[15px] font-extrabold text-primary">
            {listing.price_negotiable ? 'Negotiable' : formatPrice(listing.price, listing.currency)}
          </p>
          <h3 className="line-clamp-1 text-sm font-bold text-foreground mt-0.5">
            {listing.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

export function ListingGrid({ listings }: { listings: any[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <div key={listing.id} className="w-full [&>a]:w-full">
          <ListingCard listing={listing} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[140px] shrink-0 sm:w-[160px] space-y-2">
          <div className="aspect-square animate-pulse rounded-xl bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}