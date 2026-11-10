// features/marketplace/search.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { PRICE_RANGES, NIGERIAN_STATES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface SearchBarProps {
  categories: Category[];
  suggestions ? : { type: string;text: string } [];
}

export function SearchBar({ categories }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [, startTransition] = useTransition();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set('q', query.trim());
      } else {
        params.delete('q');
      }
      params.delete('page');
      startTransition(() => {
        router.replace(`/?${params.toString()}`, { scroll: false });
      });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
  
  return (
    <div className="sticky top-16 z-30 bg-background/95 py-3 backdrop-blur">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search PrimeMart…"
          className="w-full rounded-full border border-border bg-background py-3 pl-10 pr-10 text-sm outline-none transition focus:border-foreground"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

interface FilterBarProps {
  categories: Category[];
}

export function FilterBar({ categories }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  
  const activeCategory = searchParams.get('category');
  const activeSort = searchParams.get('sort') ?? 'newest';
  const activePrice = searchParams.get('price');
  const activeLocation = searchParams.get('location');
  
  const activeCount = [activeCategory, activePrice, activeLocation].filter(Boolean).length;
  
  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.replace(`/?${params.toString()}`, { scroll: false });
  }
  
  function clearAll() {
    const q = searchParams.get('q');
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    router.replace(`/?${params.toString()}`, { scroll: false });
  }
  
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 py-3">
        <button
          onClick={() => setOpen(true)}
          className={cn(
            'flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition',
            activeCount > 0 && 'border-foreground bg-foreground text-background'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>

        <button
          onClick={() => setParam('category', null)}
          className={cn(
            'rounded-full border border-border px-4 py-2 text-sm transition hover:bg-muted',
            !activeCategory && 'border-foreground bg-foreground text-background'
          )}
        >
          All
        </button>

        {categories.slice(0, 6).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setParam('category', cat.slug)}
            className={cn(
              'rounded-full border border-border px-4 py-2 text-sm transition hover:bg-muted',
              activeCategory === cat.slug && 'border-foreground bg-foreground text-background'
            )}
          >
            {cat.name}
          </button>
        ))}

        {(activeCount > 0 || activeSort !== 'newest') && (
          <button
            onClick={clearAll}
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl bg-background p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Price range</label>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setParam('price', range.label)}
                      className={cn(
                        'rounded-full border border-border px-3 py-1.5 text-sm transition hover:bg-muted',
                        activePrice === range.label &&
                          'border-foreground bg-foreground text-background'
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Location</label>
                <select
                  value={activeLocation ?? ''}
                  onChange={(e) => setParam('location', e.target.value || null)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Anywhere</option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Sort by</label>
                <select
                  value={activeSort}
                  onChange={(e) => setParam('sort', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="newest">Newest first</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={clearAll}
                  className="flex-1 rounded-lg border border-border py-3 text-sm font-medium"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg bg-foreground py-3 text-sm font-medium text-background"
                >
                  Show results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}