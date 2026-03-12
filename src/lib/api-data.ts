// Static API data - loaded from parsed JSON
import type { API, Category } from './supabase';

// This data will be loaded from the JSON file at build time
import apisData from '../../data/apis.json';

export const categories: Category[] = apisData.categories.map(cat => ({
  ...cat,
  api_count: apisData.apis.filter(api => api.category_id === cat.id).length
}));

export const apis: API[] = apisData.apis;

export function getApisByCategory(categorySlug: string): API[] {
  const category = categories.find(c => c.slug === categorySlug);
  if (!category) return [];
  return apis.filter(api => api.category_id === category.id);
}

export function searchApis(query: string): API[] {
  const lowerQuery = query.toLowerCase();
  return apis.filter(api =>
    api.name.toLowerCase().includes(lowerQuery) ||
    api.description.toLowerCase().includes(lowerQuery) ||
    api.category.toLowerCase().includes(lowerQuery)
  );
}

export function getApiById(id: string): API | undefined {
  return apis.find(api => api.id === id);
}

export function getApisByIds(ids: string[]): API[] {
  return apis.filter(api => ids.includes(api.id));
}

export function getFeaturedApis(count: number = 12): API[] {
  // Return a diverse set of APIs from different categories
  const featured: API[] = [];
  const usedCategories = new Set<string>();

  for (const api of apis) {
    if (!usedCategories.has(api.category) && featured.length < count) {
      featured.push(api);
      usedCategories.add(api.category);
    }
  }

  return featured;
}

export function getStats() {
  return {
    totalApis: apis.length,
    totalCategories: categories.length,
    authTypes: {
      apiKey: apis.filter(a => a.auth === 'apiKey').length,
      oauth: apis.filter(a => a.auth === 'OAuth').length,
      none: apis.filter(a => a.auth === 'No').length,
    }
  };
}
