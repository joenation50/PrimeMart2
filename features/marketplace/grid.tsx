'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, Package } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

export function ListingCard({
  listing,
  isFavorited = false,
  onToggleFavorite,
  showFavorite = false,
}: {
  listing: any;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  showFavorite?: boolean;
}) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [imgError, setImgError] = useState(false);
  
  const rawImage = listing.images?.[0];
  const primaryImage = rawImage && rawImage.startsWith('http') ? rawImage : null;

  return (
    <Link 
      href={`/listing/${listing.id}`} 
      className="group block w-full"
    >
      <div className="rounded-2xl bg-card p-2 pb-3 shadow-sm border border-border transition-transform hover:-translate-y-1">
        
        {/* IMAGE CONTAINER */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {primaryImage && !imgError ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Package className="h-6 w-6 mb-1 opacity-50" />
            </div>
          )}

          {/* FAVORITE BUTTON */}
          {showFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault(); // Stop link navigation
                setFavorited(!favorited);
                onToggleFavorite?.(listing.id);
              }}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-md shadow-sm transition hover:scale-110"
            >
              <Heart className={cn('h-4 w-4 transition', favorited ? 'fill-red-500 text-red-500' : 'text-foreground')} />
            </button>
          )}
        </div>

        {/* DETAILS */}
        <div className="mt-2 px-1">
          <p className="text-[15px] font-extrabold text-primary truncate">
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

// UPDATED: Now accepts the showFavorites prop and passes it down
export function ListingGrid({ 
  listings, 
  favoriteIds, 
  onToggleFavorite, 
  showFavorites = false 
}: { 
  listings: any[]; 
  favoriteIds?: Set<string>;
  onToggleFavorite?: (id: string) => void;
  showFavorites?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard 
          key={listing.id} 
          listing={listing} 
          isFavorited={favoriteIds?.has(listing.id)}
          onToggleFavorite={onToggleFavorite}
          showFavorite={showFavorites}
        />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="aspect-square animate-pulse rounded-xl bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted mt-2" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}