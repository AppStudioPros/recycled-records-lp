import type { MetadataRoute } from 'next';
import { store } from '@/lib/store';
export default function sitemap(): MetadataRoute.Sitemap { return store.launchReady ? [{ url: store.siteUrl, changeFrequency: 'weekly', priority: 1 }] : []; }
