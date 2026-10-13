import type { MetadataRoute } from 'next';
import { store } from '@/lib/store';
import { cities } from '@/lib/cities';
export default function sitemap(): MetadataRoute.Sitemap {
  if (!store.launchReady) return [];
  const base = store.siteUrl;
  const lastMod = '2026-10-06';
  return [
    { url: base, changeFrequency: 'weekly', priority: 1, lastModified: lastMod },
    { url: `${base}/shop`, changeFrequency: 'daily', priority: 0.9, lastModified: lastMod },
    { url: `${base}/sell`, changeFrequency: 'monthly', priority: 0.8, lastModified: lastMod },
    ...cities.map(c => ({ url: `${base}/${c.slug}`, changeFrequency: 'monthly' as const, priority: 0.7, lastModified: lastMod })),
  ];
}
