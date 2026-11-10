'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ShieldCheck, Star, Truck, AlertTriangle } from 'lucide-react';
import { formatPrice, timeAgo } from '@/lib/format';
import type { FullListing, TeaserListing } from './types';
import { ListingActions } from './actions';

interface ListingDetailProps {
  full: FullListing | null;
  teaser: TeaserListing | null;
  isLoggedIn: boolean;
}

export function ListingDetail({ full, teaser, isLoggedIn }: ListingDetailProps) {
  const data = full || teaser;
  if (!data) return null;

  const safeData = data as any;
  
  const images = safeData.images.length > 0 ? safeData.images : ['placeholder'];
  const primaryImage = images[0];
  const sellerName = full?.seller_profile?.business_name || teaser?.seller_name || 'Seller';

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 pb-24 sm:pb-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
            <Image
              src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,q_auto,f_auto/${primaryImage}`}
              alt={safeData.title}
              fill
              priority
              className="object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img: string, i: number) => (
                <div key={i} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_200,h_250,c_fill,q_auto,f_auto/${img}`}
                    alt={`${safeData.title} ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            {full?.category && <span>{full.category.name}</span>}
            <span>·</span>
            <span>Listed {timeAgo(safeData.created_at)}</span>
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">{safeData.title}</h1>
          <p className="mt-2 text-3xl font-bold">
            {safeData.price_negotiable ? <span className="text-muted-foreground text-xl">Negotiable</span> : formatPrice(safeData.price, safeData.currency)}
          </p>

          {/* Delivery & Location */}
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

          {/* Seller Block */}
          <div className="mt-6 rounded-xl border border-border p-4">
            <Link href={`/seller/${full?.seller_id || teaser?.id}`} className="flex items-center gap-3 transition hover:opacity-80">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-semibold">
                {sellerName.charAt(0) || 'S'}
              </div>
              <div>
                <p className="flex items-center gap-1 font-medium">
                  {sellerName}
                  {(full?.seller?.verification_level === 'verified' || teaser?.seller_verified) && (
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                  )}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {full?.seller?.rating_avg.toFixed(1) || teaser?.seller_rating.toFixed(1) || '0.0'} 
                  ({full?.seller?.rating_count || 0} reviews)
                </div>
              </div>
            </Link>
          </div>

          {/* Description (Gated) */}
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

          {/* WhatsApp Action */}
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