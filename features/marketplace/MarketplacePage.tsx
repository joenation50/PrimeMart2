'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { MarketplaceData, MarketplaceListing } from './types';
import { SearchBar, FilterBar } from './search';
import { 
  BannerStrip, 
  HeroStrip, 
  FeaturedCarousel, 
  VerifiedSellersStrip, 
  CategoryRows, 
  HowItWorks, 
  PricingSection 
} from './discovery';
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
  const isSearching = !!searchParams.get('q') || !!searchParams.get('category');

  return (
    <div className="bg-background text-foreground min-h-screen">
      
      {/* 1. THE BANNER (Only shows on the homepage, not when searching) */}
      {!isSearching && (
        <BannerStrip banners={initialData.banners} />
      )}
      
      {/* 2. THE HERO SECTION (Only shows on the homepage) */}
      {!isSearching && (
        <HeroStrip 
          sellerCount={initialData.verifiedSellers.length} 
          listingCount={initialData.totalCount} 
        />
      )}

      {/* 3. MAIN MARKETPLACE CONTENT */}
      <div id="listings" className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            {isSearching ? 'Search Results' : 'Discover the Marketplace'}
          </h2>
          <p className="text-muted-foreground">Browse everything on PrimeMart.</p>
        </div>
        
        <SearchBar categories={initialData.categories} />
        <FilterBar categories={initialData.categories} />

        <div className="mb-6 mt-4 text-sm font-medium text-muted-foreground">
          {initialData.totalCount} {initialData.totalCount === 1 ? 'listing' : 'listings'} found
        </div>

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-secondary/50 py-16 text-center">
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

      {/* 4. MARKETING SECTIONS (Only on Homepage) */}
      {!isSearching && (
        <>
          <HowItWorks />
          <FeaturedCarousel listings={initialData.featured} />
          <VerifiedSellersStrip sellers={initialData.verifiedSellers} />
          <CategoryRows rows={initialData.categoryRows} />
          <PricingSection />
        </>
      )}
    </div>
  );
}