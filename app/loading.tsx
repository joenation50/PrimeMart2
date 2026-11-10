// app/loading.tsx
import { SkeletonGrid } from '@/features/marketplace/grid';

export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 h-12 w-1/3 animate-pulse rounded bg-muted" />
      <SkeletonGrid count={12} />
    </div>
  );
}