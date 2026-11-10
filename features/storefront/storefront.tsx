// features/storefront/storefront.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Star, MapPin, Truck, Clock, Share2 } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { StorefrontData } from './types';
import { ListingCard } from '@/features/marketplace/grid';

export function Storefront({ data }: { data: StorefrontData }) {
  const { seller, profile, listings } = data;
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted sm:h-32 sm:w-32">
          {profile.avatar_url ? (
            <Image
              src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_200,h_200,c_fill,r_max,q_auto,f_auto/${profile.avatar_url}`}
              alt={profile.business_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold">
              {profile.business_name.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
              {profile.business_name}
              {seller.verification_level === 'verified' && (
                <ShieldCheck className="h-6 w-6 text-blue-500" />
              )}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                {seller.rating_avg.toFixed(1)} ({seller.rating_count} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Member since {formatDate(seller.created_at)}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {profile.based_city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {profile.based_city}, {profile.based_region}
              </span>
            )}
            {profile.delivers_worldwide ? (
              <span className="flex items-center gap-1">
                <Truck className="h-4 w-4 text-muted-foreground" />
                Delivers worldwide
              </span>
            ) : profile.delivers_to_countries.length > 0 ? (
              <span className="flex items-center gap-1">
                <Truck className="h-4 w-4 text-muted-foreground" />
                Delivers to {profile.delivers_to_countries.join(', ')}
              </span>
            ) : null}
          </div>
          
          <div className="flex gap-2 pt-2">
            <button className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
              <Share2 className="h-4 w-4" /> Share storefront
            </button>
          </div>
        </div>
      </div>

      {profile.bio && (
        <div className="mt-8 rounded-xl bg-muted/50 p-6 text-sm leading-relaxed text-foreground">
          {profile.bio}
        </div>
      )}

      {/* Listings */}
      <div className="mt-12">
        <h2 className="mb-6 text-xl font-bold">Listings ({listings.length})</h2>
        {listings.length === 0 ? (
          <div className="rounded-xl border border-border py-12 text-center text-muted-foreground">
            No active listings right now.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}