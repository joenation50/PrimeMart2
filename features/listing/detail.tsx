'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ShieldCheck, Star, Truck, AlertTriangle, Phone, Package, Store, ArrowLeft } from 'lucide-react';
import { formatPrice, timeAgo } from '@/lib/format';
import type { FullListing, TeaserListing } from './types';
import { ListingActions } from './actions';

interface ListingDetailProps {
  full: FullListing | null;
  teaser: TeaserListing | null;
  isLoggedIn: boolean;
}

export function ListingDetail({ full, teaser, isLoggedIn }: ListingDetailProps) {
  const [imgError, setImgError] = useState(false);
  const data = full || teaser;
  
  if (!data) return null;

  const safeData = data as any;
  
  const rawImage = safeData.images?.[0];
  const primaryImage = rawImage && rawImage.startsWith('http') 
    ? rawImage 
    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop';

  const sellerName = full?.seller_profile?.business_name || teaser?.seller_name || 'Seller';
  
  const storeSlug = full?.seller?.store_slug || full?.seller?.seller_code || teaser?.seller_slug;
  const storeLink = storeSlug ? `/store/${storeSlug}` : null;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 pb-28 sm:pb-12">
      
      {/* NEW: BACK BUTTON */}
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        
        {/* IMAGE SECTION */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary border border-border">
            {!imgError ? (
              <Image
                src={primaryImage}
                alt={safeData.title}
                fill
                priority
                className="object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                <Package className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">No Image Available</p>
              </div>
            )}
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            {full?.category && <span>{full.category.name}</span>}
            <span>·</span>
            <span>Listed {timeAgo(safeData.created_at)}</span>
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">{safeData.title}</h1>
          
          <div className="mt-2 flex items-end justify-between">
            <p className="text-3xl font-bold text-primary">
              {safeData.price_negotiable ? <span className="text-muted-foreground text-xl">Negotiable</span> : formatPrice(safeData.price, safeData.currency)}
            </p>
            {isLoggedIn && (
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Package className="h-4 w-4" /> Qty: {safeData.quantity || 1}
              </p>
            )}
          </div>

          <div className="mt-6 space-y-3 rounded-xl border border-border p-4 text-sm">
            {safeData.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{safeData.location}</span>
              </div>
            )}
            {full?.seller_profile?.delivers_worldwide ? (
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>Delivers worldwide</span>
              </div>
            ) : full?.seller_profile?.delivers_to_countries && full.seller_profile.delivers_to_countries.length > 0 ? (
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>Delivers to {full.seller_profile.delivers_to_countries.join(', ')}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-lg font-semibold overflow-hidden">
                  {full?.seller_profile?.logo_url ? (
                     <Image src={full.seller_profile.logo_url} alt={sellerName} width={48} height={48} className="object-cover" />
                  ) : (
                    sellerName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="flex items-center gap-1 font-medium">
                    {sellerName}
                    {(full?.seller?.verification_level === 'verified' || teaser?.seller_verified) && (
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    )}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {full?.seller?.rating_avg?.toFixed(1) || teaser?.seller_rating?.toFixed(1) || '0.0'} 
                    ({full?.seller?.rating_count || 0} reviews)
                  </div>
                </div>
              </div>

              {storeLink && (
                <Link href={storeLink} target="_blank" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors">
                  <Store className="h-3.5 w-3.5" /> Visit Store
                </Link>
              )}
            </div>

            {isLoggedIn && full?.seller?.phone && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm font-medium">
                <Phone className="h-4 w-4 text-primary" />
                {full.seller.phone}
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Description</h2>
            {full ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {full.description || 'No description provided.'}
              </p>
            ) : (
              <div className="mt-2 rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Sign in to view the full description and contact the seller.</p>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" /> Safety Warning
            </p>
            <p className="mt-1 opacity-90">Never pay before seeing the item. PrimeMart does not hold funds or mediate disputes.</p>
          </div>

          {/* Desktop Actions */}
          <div className="mt-6 hidden sm:block">
            <ListingActions
              listingId={safeData.id}
              sellerPhone={full?.seller?.phone || null}
              listingTitle={safeData.title}
              price={safeData.price}
              currency={safeData.currency}
              isFavorited={full?.is_favorited || false}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action */}
      <div className="sm:hidden">
        <ListingActions
          listingId={safeData.id}
          sellerPhone={full?.seller?.phone || null}
          listingTitle={safeData.title}
          price={safeData.price}
          currency={safeData.currency}
          isFavorited={full?.is_favorited || false}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
}