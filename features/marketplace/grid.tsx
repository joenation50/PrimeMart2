'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, Package, BadgeCheck, Store } from 'lucide-react';
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
  
  const isSold = listing.status === 'sold';
  
  // Check if the item was created in the last 3 days
  const isNew = listing.created_at 
    ? new Date().getTime() - new Date(listing.created_at).getTime() < 3 * 24 * 60 * 60 * 1000 
    : false;

  // Get seller name safely
  const sellerName = listing.users?.seller_profiles?.business_name || listing.users?.name || 'PrimeMart Vendor';

  return (
    <Link 
      href={`/listing/${listing.id}`} 
      className="group relative flex flex-col bg-card border border-border rounded-[1.5rem] overflow-hidden hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out"
    >
      
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
        {primaryImage && !imgError ? (
          <Image
            src={primaryImage}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={cn(
              "object-cover transition-transform duration-700 ease-out group-hover:scale-110",
              isSold && "blur-sm opacity-80"
            )}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-secondary/50">
            <Package className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-xs font-medium opacity-50">No Image</span>
          </div>
        )}

        {/* SOLD OUT OVERLAY */}
        {isSold && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-black uppercase tracking-widest text-sm shadow-lg border border-red-400/50">
              Sold
            </span>
          </div>
        )}

        {/* TOP BADGES (Verified & New) */}
        {!isSold && (
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5 items-start">
            {listing.users?.verification_level === 'verified' && (
              <div className="bg-background/80 backdrop-blur-md border border-border px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-black text-foreground uppercase tracking-wider">Verified</span>
              </div>
            )}
            {isNew && (
              <div className="bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground px-2 py-1 rounded-full shadow-sm">
                <span className="text-[9px] font-black uppercase tracking-wider">New Drop</span>
              </div>
            )}
          </div>
        )}

        {/* FAVORITE BUTTON */}
        {showFavorite && !isSold && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault(); // Stop link navigation
              setFavorited(!favorited);
              onToggleFavorite?.(listing.id);
            }}
            className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-background/60 backdrop-blur-md border border-border shadow-sm transition-all hover:scale-110 active:scale-95 hover:bg-background group/heart"
          >
            <Heart className={cn(
              'h-4 w-4 transition-colors', 
              favorited ? 'fill-red-500 text-red-500 border-none' : 'text-foreground group-hover/heart:text-red-400'
            )} />
          </button>
        )}
      </div>

      {/* DETAILS CONTAINER */}
      <div className="p-3.5 flex flex-col flex-1 bg-gradient-to-b from-transparent to-secondary/20">
        <h3 className="line-clamp-2 text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors mb-1.5">
          {listing.title}
        </h3>
        
        <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate mb-3">
          <Store className="h-3 w-3 shrink-0 opacity-70" />
          {sellerName}
        </p>
        
        <div className="mt-auto pt-2 border-t border-border/60 flex items-center justify-between">
          <p className="text-base font-black text-foreground">
            {listing.price_negotiable ? (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Negotiable</span>
            ) : (
              formatPrice(listing.price, listing.currency)
            )}
          </p>
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
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
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
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col rounded-[1.5rem] overflow-hidden border border-border bg-card">
          <div className="aspect-[4/5] animate-pulse bg-secondary" />
          <div className="p-3.5 space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-secondary mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}