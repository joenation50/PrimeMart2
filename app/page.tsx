// app/page.tsx
import { Suspense } from 'react';
import { getMarketplaceData } from '@/features/marketplace/queries';
import { MarketplacePage } from '@/features/marketplace/MarketplacePage';
import { SkeletonGrid } from '@/features/marketplace/grid';
import { getSession } from '@/lib/auth';
import type { MarketplaceFilters } from '@/features/marketplace/types';

interface PageProps {
  searchParams: {
    q?: string;
    category?: string;
    price?: string;
    location?: string;
    sort?: string;
    page?: string;
  };
}

export const revalidate = 60; // Revalidate every 60 seconds

function parseFilters(searchParams: PageProps['searchParams']): MarketplaceFilters {
  return {
    q: searchParams.q,
    category: searchParams.category,
    location: searchParams.location,
    sort:
      searchParams.sort === 'price_asc' ||
      searchParams.sort === 'price_desc' ||
      searchParams.sort === 'best_rated'
        ? searchParams.sort
        : 'newest',
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const filters = parseFilters(searchParams);
  const [data, session] = await Promise.all([
    getMarketplaceData(filters),
    getSession(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <SkeletonGrid count={12} />
        </div>
      }
    >
      <MarketplacePage initialData={data} isLoggedIn={!!session} />
    </Suspense>
  );
}