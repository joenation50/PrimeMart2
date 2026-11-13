'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, ShieldCheck, Package } from 'lucide-react';
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
  
  // Safely extract the first image from the text[] array
  const rawImage = listing.images?.[0];
  
  // Ensure it's a valid URL
  const primaryImage = rawImage && rawImage.startsWith('http') 
    ? rawImage 
    : null;

  const sellerName = listing.seller_profiles?.business_name || listing.users?.name || 'Seller';
  const isVerified = listing.users?.verification_level === 'verified';

  return (
    <Link href={`/listing/${listing.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary border border-border/50">
        
        {/* IMAGE OR FALLBACK */}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary text-muted-foreground">
            <Package className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}

        {/* Favorite Button */}
        {showFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setFavorited(!favorited);
              onToggleFavorite?.(listing.id);
            }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition hover:scale-110"
          >
            <Heart className={cn('h-4 w-4 transition', favorited ? 'fill-red-500 text-red-500' : 'text-foreground')} />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium text-muted-foreground truncate max-w-[150px]">
            {sellerName}
          </p>
          {isVerified && <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
        </div>
        
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        
        <p className="pt-1 text-base font-bold text-foreground">
          {listing.price_negotiable ? (
            <span className="text-sm text-muted-foreground font-medium">Negotiable</span>
          ) : (
            formatPrice(listing.price, listing.currency)
          )}
        </p>
      </div>
    </Link>
  );
}

export function ListingGrid({
  listings,
  favoriteIds,
  onToggleFavorite,
  showFavorites = false,
}: {
  listings: any[];
  favoriteIds?: Set<string>;
  onToggleFavorite?: (id: string) => void;
  showFavorites?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
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

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}