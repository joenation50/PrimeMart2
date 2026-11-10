// lib/seo.ts
import type { Metadata } from 'next';
import { SITE_NAME, SITE_TAGLINE } from './constants';
import { env } from './env';

export function baseMetadata(): Metadata {
  return {
    metadataBase: new URL(env.siteUrl),
    title: {
      default: `${SITE_NAME} — ${SITE_TAGLINE}`,
      template: `%s · ${SITE_NAME}`,
    },
    description: 'Verified sellers across Nigeria. Free to browse. ₦5,000/year to sell on PrimeMart.',
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      siteName: SITE_NAME,
      type: 'website',
      images: ['/og-default.png'],
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export function listingMetadata(listing: {
  title: string;
  price: number;
  currency: string;
  images: string[];
}): Metadata {
  return {
    title: `${listing.title} · ${listing.price}`,
    description: `Buy ${listing.title} on ${SITE_NAME}.`,
    openGraph: {
      title: listing.title,
      description: `Buy ${listing.title} on ${SITE_NAME}.`,
      images: listing.images.slice(0, 1),
    },
  };
}

export function sellerMetadata(seller: { business_name: string;bio ? : string | null }): Metadata {
  return {
    title: seller.business_name,
    description: seller.bio || `${seller.business_name} on ${SITE_NAME}`,
    openGraph: {
      title: seller.business_name,
      description: seller.bio || `${seller.business_name} on ${SITE_NAME}`,
    },
  };
}