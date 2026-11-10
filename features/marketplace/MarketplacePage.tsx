'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { MarketplaceData, MarketplaceListing } from './types';
import { SearchBar, FilterBar } from './search';
import { BannerStrip, HeroStrip, FeaturedCarousel, VerifiedSellersStrip, CategoryRows } from './discovery';
import { ListingGrid, LoadMoreButton } from './grid';

interface MarketplacePageProps {
  initialData: MarketplaceData;
  isLoggedIn: boolean;
}

export function MarketplacePage({ initialData, isLoggedIn }: MarketplacePageProps) {
  const [listings] = useState<MarketplaceListing[]>(initialData.listings);
  const searchParams = useSearchParams();
  const router = useRouter();

  const hasMore = listings.length < initialData.totalCount;
  const showDiscoverySections = !searchParams.get('q') && !searchParams.get('category');

  return (
    <div className="container mx-auto max-w-7xl px-4 pb-16">
      <BannerStrip banners={initialData.banners} />
      <HeroStrip
        sellerCount={initialData.verifiedSellers.length}
        listingCount={initialData.totalCount}
      />

      <SearchBar categories={initialData.categories} />

      {showDiscoverySections && (
        <>
          <FeaturedCarousel listings={initialData.featured} />
          <VerifiedSellersStrip sellers={initialData.verifiedSellers} />
          <CategoryRows rows={initialData.categoryRows} />
        </>
      )}

      <div id="listings" className="mt-8">
        <FilterBar categories={initialData.categories} />

        <div className="mb-4 text-sm text-muted-foreground">
          {initialData.totalCount} {initialData.totalCount === 1 ? 'listing' : 'listings'}
        </div>

        {listings.length === 0 ? (
          <div className="rounded-xl border border-border py-16 text-center">
            <p className="text-lg font-medium">No listings found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or search.</p>
          </div>
        ) : (
          <>
            <ListingGrid listings={listings} showFavorites={isLoggedIn} />
            <LoadMoreButton hasMore={hasMore} loading={false} onClick={() => router.push('/')} />
          </>
        )}
      </div>
    </div>
  );
}