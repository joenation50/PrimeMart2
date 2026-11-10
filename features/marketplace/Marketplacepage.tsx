// features/marketplace/MarketplacePage.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getMarketplaceData } from './queries';
import type { MarketplaceData, MarketplaceListing } from './types';
import { SearchBar, FilterBar } from './search';
import {
  BannerStrip,
  HeroStrip,
  FeaturedCarousel,
  VerifiedSellersStrip,
  CategoryRows,
} from './discovery';
import { ListingGrid, LoadMoreButton, SkeletonGrid } from './grid';

interface MarketplacePageProps {
  initialData: MarketplaceData;
  isLoggedIn: boolean;
}

export function MarketplacePage({ initialData, isLoggedIn }: MarketplacePageProps) {
  const [listings, setListings] = useState < MarketplaceListing[] > (initialData.listings);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const hasMore = listings.length < initialData.totalCount;
  
  async function loadMore() {
    setLoading(true);
    const nextPage = page + 1;
    // In a real implementation, fetch next page via API route.
    // For now, this is a placeholder that revalidates.
    setLoading(false);
    setPage(nextPage);
  }
  
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
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your filters or search.
            </p>
          </div>
        ) : (
          <>
            <ListingGrid listings={listings} showFavorites={isLoggedIn} />
            <LoadMoreButton
              hasMore={hasMore}
              loading={loading}
              onClick={loadMore}
            />
          </>
        )}
      </div>
    </div>
  );
}

export { getMarketplaceData };