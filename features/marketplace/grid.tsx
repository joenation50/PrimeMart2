'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, ShieldCheck } from 'lucide-react';
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
  
  // Fallback image if none exists
  const primaryImage = listing.images?.[0] 
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_600,h_750,c_fill,q_auto,f_auto/${listing.images[0]}`
    : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop";

  const sellerName = listing.seller_profile?.business_name || listing.users?.name || 'Seller';
  const isVerified = listing.users?.verification_level === 'verified';

  return (
    <Link href={`/listing/${listing.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary border border-border/50">
        <Image
          src={primaryImage}
          alt={listing.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Favorite Button */}
        {showFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setFavorited(!favorited);
              onToggleFavorite?.(listing.id);
            }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full glass-card transition hover:scale-110"
          >
            <Heart className={cn('h-4 w-4 transition', favorited ? 'fill-primary text-primary' : 'text-foreground')} />
          </button>
        )}
        
        {/* Featured Tag */}
        {listing.featured_until && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-lg">
            Featured
          </span>
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