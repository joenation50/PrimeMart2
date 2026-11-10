// lib/search.ts

export function normalizeTitle(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

export function buildSearchQuery(
  query: string,
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    verifiedOnly?: boolean;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'best_rated';
  } = {}
): { search: string; category?: string; min?: number; max?: number; location?: string } {
  return {
    search: normalizeTitle(query),
    category: filters.category,
    min: filters.minPrice,
    max: filters.maxPrice,
    location: filters.location,
  };
}

export function getSearchSuggestions(
  query: string,
  categories: { name: string; slug: string }[],
  titles: string[],
  limit = 5
): { type: 'category' | 'title'; text: string; slug?: string }[] {
  if (query.trim().length < 2) return [];
  const q = query.toLowerCase();

  const matchingCategories = categories
    .filter((c) => c.name.toLowerCase().includes(q))
    .slice(0, 2)
    .map((c) => ({ type: 'category' as const, text: c.name, slug: c.slug }));

  const matchingTitles = titles
    .filter((t) => t.toLowerCase().includes(q))
    .slice(0, limit - matchingCategories.length)
    .map((t) => ({ type: 'title' as const, text: t }));

  return [...matchingCategories, ...matchingTitles];
}