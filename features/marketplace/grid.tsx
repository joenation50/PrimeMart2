'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { MarketplaceListing } from './types';

interface ListingCardProps {
  listing: MarketplaceListing;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  showFavorite?: boolean;
}

function isNew(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

export function ListingCard({
  listing,
  isFavorited = false,
  onToggleFavorite,
  showFavorite = false,
}: ListingCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const primaryImage = listing.images[0];

  return (
    <Link href={`/listing/${listing.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-secondary">
        {primaryImage ? (
          <Image
            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_600,h_750,c_fill,q_auto,f_auto/${primaryImage}`}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {isNew(listing.created_at) && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">New</span>
        )}

        {listing.featured_until && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold text-white shadow-lg">Featured</span>
        )}

        {showFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setFavorited(!favorited);
              onToggleFavorite?.(listing.id);
            }}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full glass-card transition hover:scale-110"
          >
            <Heart className={cn('h-4 w-4 transition', favorited ? 'fill-primary text-primary' : 'text-foreground')} />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{listing.title}</h3>
        <p className="text-base font-semibold">
          {listing.price_negotiable ? (
            <span className="text-muted-foreground text-sm">Negotiable</span>
          ) : (
            formatPrice(listing.price, listing.currency)
          )}
        </p>
      </div>
    </Link>
  );
}

interface ListingGridProps {
  listings: MarketplaceListing[];
  favoriteIds?: Set<string>;
  onToggleFavorite?: (id: string) => void;
  showFavorites?: boolean;
}

export function ListingGrid({
  listings,
  favoriteIds,
  onToggleFavorite,
  showFavorites = false,
}: ListingGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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

interface LoadMoreButtonProps {
  hasMore: boolean;
  loading: boolean;
  onClick: () => void;
}

export function LoadMoreButton({ hasMore, loading, onClick }: LoadMoreButtonProps) {
  if (!hasMore) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        You&apos;ve seen everything. Check back soon.
      </div>
    );
  }
  return (
    <div className="py-12 text-center">
      <button
        onClick={onClick}
        disabled={loading}
        className="rounded-full border border-border px-8 py-3 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
      >
        {loading ? 'Loading…' : 'Load more'}
      </button>
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
}

export function SkeletonGrid({ count = 8 }: SkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}