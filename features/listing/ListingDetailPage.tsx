// features/listing/ListingDetailPage.tsx
import { getListingData } from './queries';
import { ListingDetail } from './detail';
import { notFound } from 'next/navigation';

export async function ListingDetailPage({ id }: { id: string }) {
  const { full, teaser, isLoggedIn } = await getListingData(id);
  
  if (!full && !teaser) {
    notFound();
  }
  
  return <ListingDetail full={full} teaser={teaser} isLoggedIn={isLoggedIn} />;
}