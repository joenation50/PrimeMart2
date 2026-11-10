// features/storefront/StorefrontPage.tsx
import { getStorefrontData } from './queries';
import { Storefront } from './storefront';
import { notFound } from 'next/navigation';

export async function StorefrontPage({ id }: { id: string }) {
  const data = await getStorefrontData(id);
  if (!data) notFound();
  return <Storefront data={data} />;
}