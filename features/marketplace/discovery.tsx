// features/marketplace/discovery.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShieldCheck, ChevronRight } from 'lucide-react';
import { formatPrice, formatCompact } from '@/lib/format';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';
import type { Category, Banner } from '@/types';
import type { MarketplaceListing, VerifiedSeller, CategoryRow } from './types';
import { ListingCard } from './grid';

// ============================================================
// BANNER
// ============================================================
export function BannerStrip({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;
  
  return (
    <div className="mb-6 space-y-3">
      {banners.map((banner) => (
        <Link
          key={banner.id}
          href={banner.cta_url ?? '#'}
          className="block overflow-hidden rounded-xl bg-gradient-to-r from-foreground to-foreground/80 p-4 text-background sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-base font-semibold sm:text-lg">{banner.headline}</p>
              {banner.subtext && (
                <p className="mt-1 text-sm opacity-90">{banner.subtext}</p>
              )}
            </div>
            {banner.cta_text && (
              <span className="shrink-0 rounded-full bg-background/20 px-4 py-2 text-sm font-medium">
                {banner.cta_text}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

// ============================================================
// HERO
// ============================================================
interface HeroStripProps {
  sellerCount: number;
  listingCount: number;
}

export function HeroStrip({ sellerCount, listingCount }: HeroStripProps) {
  return (
    <section className="py-8 sm:py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        Buy and sell on WhatsApp
      </h1>
      <p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
        {SITE_NAME} connects you with verified sellers across Nigeria. Browse free. Sell for ₦5,000/year.
      </p>
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span>{formatCompact(sellerCount)} sellers</span>
        <span>·</span>
        <span>{formatCompact(listingCount)} listings</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="#listings"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
        >
          Browse listings
        </a>
        <Link
          href="/account/upgrade"
          className="rounded-full border border-border px-6 py-3 text-sm font-medium"
        >
          Sell on {SITE_NAME} — ₦5k/year
        </Link>
      </div>
    </section>
  );
}

// ============================================================
// FEATURED CAROUSEL
// ============================================================
export function FeaturedCarousel({ listings }: { listings: MarketplaceListing[] }) {
  if (listings.length === 0) return null;
  
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Featured listings</h2>
        <Link href="/?sort=newest" className="flex items-center gap-1 text-sm text-muted-foreground">
          See all <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {listings.map((listing) => (
          <div key={listing.id} className="w-48 shrink-0 sm:w-56">
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// VERIFIED SELLERS STRIP
// ============================================================
export function VerifiedSellersStrip({ sellers }: { sellers: VerifiedSeller[] }) {
  if (sellers.length < 4) return null;
  
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          Verified sellers
        </h2>
        <Link href="/verified-sellers" className="flex items-center gap-1 text-sm text-muted-foreground">
          See all <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sellers.map((seller) => (
          <Link
            key={seller.id}
            href={`/seller/${seller.id}`}
            className="w-40 shrink-0 rounded-xl border border-border p-4 text-center transition hover:border-foreground"
          >
            <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full bg-muted">
              {seller.avatar_url ? (
                <Image
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_200,h_200,c_fill,r_max,q_auto,f_auto/${seller.avatar_url}`}
                  alt={seller.business_name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-lg font-semibold">
                  {seller.business_name[0]}
                </div>
              )}
            </div>
            <p className="flex items-center justify-center gap-1 truncate text-sm font-medium">
              {seller.business_name}
              <ShieldCheck className="h-3 w-3 shrink-0 text-blue-500" />
            </p>
            <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              {seller.rating_avg.toFixed(1)} ({seller.rating_count})
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {seller.listing_count} listings
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// CATEGORY ROWS
// ============================================================
export function CategoryRows({ rows }: { rows: CategoryRow[] }) {
  if (rows.length === 0) return null;
  
  return (
    <div className="space-y-10">
      {rows.map((row) => (
        <section key={row.category.id}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{row.category.name}</h2>
            <Link
              href={`/?category=${row.category.slug}`}
              className="flex items-center gap-1 text-sm text-muted-foreground"
            >
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {row.listings.map((listing) => (
              <div key={listing.id} className="w-40 shrink-0 sm:w-48">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}