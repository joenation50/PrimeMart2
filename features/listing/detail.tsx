'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, ShieldCheck, Star, Truck, AlertTriangle, 
  Phone, Package, Store, ArrowLeft, Tag, Calendar, Box, Share2
} from 'lucide-react';
import { formatPrice, timeAgo, formatDate } from '@/lib/format';
import type { FullListing, TeaserListing } from './types';
import { ListingActions } from './actions';
import { cn } from '@/lib/utils';

interface ListingDetailProps {
  full: FullListing | null;
  teaser: TeaserListing | null;
  isLoggedIn: boolean;
}

export function ListingDetail({ full, teaser, isLoggedIn }: ListingDetailProps) {
  const [imgError, setImgError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const data = full || teaser;
  
  if (!data) return null;

  const safeData = data as any;
  const images = safeData.images || [];

  // Helper to safely get the URL
  const getImageUrl = (img: string) => {
    if (!img || !img.startsWith('http')) return null;
    return img;
  };

  const primaryImage = images.length > 0 ? getImageUrl(images[activeImage]) : null;

  useEffect(() => {
    setImgError(false);
  }, [activeImage]);

  const sellerName = full?.seller_profile?.business_name || teaser?.seller_name || 'Seller';
  const sellerLogo = (full as any)?.seller_profile?.logo_url;
  const storeSlug = full?.seller?.store_slug || full?.seller?.seller_code || teaser?.seller_slug;
  const storeLink = storeSlug ? `/store/${storeSlug}` : null;

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: safeData.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {}
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 pb-28 sm:pb-12">
      
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        
        {/* LEFT COLUMN: IMAGES */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-secondary border border-border shadow-sm">
            {primaryImage && !imgError ? (
              <Image
                src={primaryImage}
                alt={safeData.title}
                fill
                priority
                className="object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground bg-muted/30">
                <Package className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-sm font-medium">No Image Available</p>
              </div>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
              {images.map((img: string, i: number) => {
                const thumbUrl = getImageUrl(img);
                if (!thumbUrl) return null;
                
                return (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)} 
                    className={cn(
                      "relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all bg-secondary", 
                      activeImage === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <Image src={thumbUrl} alt={`View ${i+1}`} fill className="object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DETAILS */}
        <div className="flex flex-col">
          
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            {full?.category ? <span>{full.category.name}</span> : <span>General</span>}
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Listed {timeAgo(safeData.created_at)}</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-extrabold text-foreground leading-tight">{safeData.title}</h1>
            <button 
              onClick={handleShare}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background hover:bg-secondary transition-colors mt-1 shadow-sm"
            >
              <Share2 className="h-4 w-4 text-foreground" />
            </button>
          </div>
          
          <div className="mt-3 flex items-end justify-between">
            <p className="text-4xl font-black text-primary">
              {safeData.price_negotiable ? (
                <span className="text-xl text-muted-foreground font-semibold">Negotiable</span>
              ) : (
                formatPrice(safeData.price, safeData.currency)
              )}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-lg"><Tag className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm font-semibold capitalize">{full?.category?.name || safeData.category || 'General'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-lg"><Box className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Quantity</p>
                <p className="text-sm font-semibold">{isLoggedIn ? (safeData.quantity || 1) : 'Hidden'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-lg"><MapPin className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-semibold truncate max-w-[100px]">{safeData.location || 'Nigeria'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-lg"><Calendar className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Date Listed</p>
                <p className="text-sm font-semibold">{formatDate(safeData.created_at)}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-lg font-semibold overflow-hidden shrink-0 border border-border">
                  {sellerLogo ? (
                     <Image src={sellerLogo} alt={sellerName} width={48} height={48} className="object-cover" />
                  ) : (
                    sellerName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="flex items-center gap-1 font-bold text-foreground">
                    {sellerName}
                    {(full?.seller?.verification_level === 'verified' || teaser?.seller_verified) && (
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    )}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {full?.seller?.rating_avg?.toFixed(1) || teaser?.seller_rating?.toFixed(1) || '0.0'} 
                    ({full?.seller?.rating_count || 0} reviews)
                  </div>
                </div>
              </div>

              {storeLink && (
                <Link href={storeLink} target="_blank" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary/80 transition-colors">
                  <Store className="h-3.5 w-3.5" /> Visit Store
                </Link>
              )}
            </div>

            {isLoggedIn && full?.seller?.phone && (
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm font-semibold">
                <Phone className="h-4 w-4 text-primary" />
                {full.seller.phone}
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Description</h2>
            {full ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {full.description || 'No description provided.'}
              </p>
            ) : (
              <div className="rounded-xl bg-muted/50 p-6 text-center border border-border">
                <p className="text-sm font-medium text-muted-foreground mb-3">Sign in to view the full description and contact the seller.</p>
                <Link href={`/login?redirect=/listing/${safeData.id}`} className="inline-flex rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground">
                  Sign In
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 border border-amber-500/20">
            <p className="flex items-center gap-2 font-bold mb-1">
              <AlertTriangle className="h-4 w-4" /> Safety Warning
            </p>
            <p className="opacity-90 leading-relaxed">Never pay before seeing the item. PrimeMart does not hold funds or mediate disputes. Meet in a safe public place.</p>
          </div>

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