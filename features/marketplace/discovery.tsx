'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShieldCheck, ArrowRight, MessageCircle, Lock, Zap, Check, ChevronRight } from 'lucide-react';
import { formatCompact } from '@/lib/format';
import { SITE_NAME } from '@/lib/constants';
import type { Banner } from '@/types';
import type { MarketplaceListing, VerifiedSeller, CategoryRow } from './types';
import { ListingCard } from './grid';

export function BannerStrip({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6">
      {banners.map((banner) => (
        <Link
          key={banner.id}
          href={banner.cta_url ?? '#'}
          className="group relative flex min-h-[200px] w-full overflow-hidden rounded-3xl border border-border"
        >
          {banner.image_url && banner.image_url !== 'placeholder' ? (
            <Image
              src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,h_400,c_fill,q_auto,f_auto/${banner.image_url}`}
              alt={banner.headline}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600" />
          )}

          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 flex w-full items-center justify-between p-8 sm:p-12">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-4xl">{banner.headline}</h2>
              {banner.subtext && <p className="mt-2 text-sm text-white/90 sm:text-lg">{banner.subtext}</p>}
            </div>
            {banner.cta_text && (
              <span className="hidden shrink-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-transform group-hover:scale-105 sm:block">
                {banner.cta_text}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export function HeroStrip({ sellerCount, listingCount }: { sellerCount: number; listingCount: number }) {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop"
          alt="Shopping background"
          fill
          priority
          className="object-cover opacity-40 dark:opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:py-32">
        <div className="max-w-2xl">
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-border glass-card px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-foreground">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Trusted by {formatCompact(sellerCount)} sellers
          </div>

          <h1 className="animate-slide-up text-5xl font-medium tracking-tighter text-balance sm:text-7xl lg:text-8xl mb-8 text-foreground">
            The quiet your <br className="hidden sm:block" />
            <span className="italic font-serif text-primary">best sales</span> need.
          </h1>

          <p className="animate-slide-up max-w-lg text-lg text-muted-foreground mb-12" style={{ animationDelay: '100ms' }}>
            PrimeMart seals off the noise. Verified sellers, direct WhatsApp chats, and zero commission. Your marketplace, operating in perfect focus.
          </p>

          <div className="animate-slide-up flex flex-col items-start gap-4 sm:flex-row" style={{ animationDelay: '200ms' }}>
            <Link href="/signup" className="group flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 animate-glow">
              Start selling today <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#listings" className="flex items-center justify-center rounded-full glass-card px-8 py-4 text-sm font-medium text-foreground hover:bg-secondary transition-all">
              Explore marketplace
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="py-24 border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-16 md:flex md:items-end md:justify-between">
          <div className="max-w-lg">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">01 — The Process</p>
            <h2 className="text-3xl font-medium tracking-tight sm:text-5xl">Busy was never the problem.</h2>
          </div>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          {[
            { icon: Lock, title: "Seal off the noise.", desc: "Create your listing and lock in your price. No confusing forms, just direct selling." },
            { icon: ShieldCheck, title: "Make trust visible.", desc: "Pay your subscription and get the verified badge. Buyers know you're serious." },
            { icon: MessageCircle, title: "Keep the chain alive.", desc: "Buyers hit you up on WhatsApp. You negotiate, close the deal, and get paid." },
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-medium">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">08 — Pricing</p>
        <h2 className="mb-12 text-3xl font-medium tracking-tight sm:text-5xl">A small habit. A noticeably different week.</h2>

        <div className="mx-auto max-w-sm rounded-3xl border border-primary/30 bg-secondary/50 p-8 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">PRO SELLER</div>

          <h3 className="text-lg font-medium mb-2">PrimeMart Seller</h3>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-5xl font-semibold">₦5k</span>
            <span className="text-muted-foreground">/year</span>
          </div>

          <ul className="mb-8 space-y-3">
            {["Unlimited listings", "Direct WhatsApp integration", "Verified Badge", "Basic Analytics"].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" /> {item}
              </li>
            ))}
          </ul>

          <Link href="/signup" className="flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Start free trial
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FeaturedCarousel({ listings }: { listings: MarketplaceListing[] }) {
  if (listings.length === 0) return null;
  return (
    <section className="py-16 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between px-4">
          <h2 className="text-2xl font-bold tracking-tight">Popular right now</h2>
          <Link href="/?sort=newest" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">See all <ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {listings.map((listing) => (
            <div key={listing.id} className="w-56 shrink-0 transition-transform hover:-translate-y-1">
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VerifiedSellersStrip({ sellers }: { sellers: VerifiedSeller[] }) {
  if (sellers.length < 4) return null;
  return (
    <section className="py-16 border-t border-border bg-secondary/20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between px-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <ShieldCheck className="h-6 w-6 text-primary" /> Verified Sellers
          </h2>
          <Link href="/verified-sellers" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">See all <ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sellers.map((seller) => (
            <Link key={seller.id} href={`/seller/${seller.id}`} className="group flex w-48 shrink-0 flex-col items-center rounded-2xl border border-border bg-background p-6 text-center transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 h-20 w-20 overflow-hidden rounded-full bg-secondary ring-4 ring-background">
                {seller.avatar_url ? (
                  <Image src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_200,h_200,c_fill,r_max,q_auto,f_auto/${seller.avatar_url}`} alt={seller.business_name} width={80} height={80} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">{seller.business_name[0]}</div>
                )}
              </div>
              <p className="flex items-center justify-center gap-1 truncate text-sm font-semibold">
                {seller.business_name}
                <ShieldCheck className="h-3 w-3 shrink-0 text-primary" />
              </p>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                {seller.rating_avg.toFixed(1)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoryRows({ rows }: { rows: CategoryRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="mx-auto max-w-7xl py-16 space-y-16 px-4">
      {rows.map((row) => (
        <section key={row.category.id}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">{row.category.name}</h2>
            <Link href={`/?category=${row.category.slug}`} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {row.listings.map((listing) => (
              <div key={listing.id} className="w-48 shrink-0 transition-transform hover:-translate-y-1">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}