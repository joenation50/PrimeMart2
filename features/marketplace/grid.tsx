'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, Package, BadgeCheck } from 'lucide-react';
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

  // Check if the item was created in the last 3 days
  const isNew = listing.created_at 
    ? new Date().getTime() - new Date(listing.created_at).getTime() < 3 * 24 * 60 * 60 * 1000 
    : false;

  // Get seller name safely
  const sellerName = listing.users?.seller_profiles?.business_name || listing.users?.name || 'PrimeMart Vendor';

  return (
    <Link 
      href={`/listing/${listing.id}`} 
      className="group block w-full"
    >
      <div className="rounded-3xl bg-card border border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-300">
        
        {/* IMAGE CONTAINER */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
          {primaryImage && !imgError ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Package className="h-8 w-8 mb-2 opacity-50" />
              <span className="text-xs font-medium opacity-50">No Image</span>
            </div>
          )}

          {/* TOP BADGES */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 items-start">
            {listing.users?.verification_level === 'verified' && (
              <div className="bg-background/80 backdrop-blur-md border border-border px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-black text-foreground uppercase tracking-wider">Verified</span>
              </div>
            )}
            {isNew && (
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full shadow-sm">
                <span className="text-[9px] font-black uppercase tracking-wider">New Drop</span>
              </div>
            )}
          </div>

          {/* FAVORITE BUTTON */}
          {showFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault(); // Stop link navigation
                setFavorited(!favorited);
                onToggleFavorite?.(listing.id);
              }}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/60 backdrop-blur-md border border-border shadow-sm transition-all hover:scale-110 hover:bg-background"
            >
              <Heart className={cn('h-4 w-4 transition', favorited ? 'fill-red-500 text-red-500 border-none' : 'text-foreground')} />
            </button>
          )}
        </div>

        {/* DETAILS */}
        <div className="p-3.5 flex flex-col">
          <h3 className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <p className="text-[11px] text-muted-foreground mb-2 truncate">
            {sellerName}
          </p>
          
          <div className="mt-auto pt-2 border-t border-border">
            <p className="text-base font-black text-foreground">
              {listing.price_negotiable ? 'Negotiable' : formatPrice(listing.price, listing.currency)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

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
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
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
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <div className="aspect-[4/5] animate-pulse rounded-3xl bg-secondary border border-border" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-secondary mt-2" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
        </div>
      ))}
    </div>
  );
}