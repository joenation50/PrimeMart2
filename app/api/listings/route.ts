// app/api/listings/route.ts
import { NextResponse } from 'next/server';
import { getListings } from '@/features/marketplace/queries';
import type { MarketplaceFilters } from '@/features/marketplace/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const filters: MarketplaceFilters = {
    q: searchParams.get('q') || undefined,
    category: searchParams.get('category') || undefined,
    location: searchParams.get('location') || undefined,
    sort: (searchParams.get('sort') as any) || 'newest',
    page: searchParams.get('page') ? parseInt(searchParams.get('page') !) : 1,
  };
  
  const { listings, totalCount } = await getListings(filters);
  
  return NextResponse.json({ listings, totalCount });
}