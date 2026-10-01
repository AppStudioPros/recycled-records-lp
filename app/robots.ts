import type { MetadataRoute } from 'next';
import { store } from '@/lib/store';
export default function robots(): MetadataRoute.Robots {
 return { rules: { userAgent: '*', ...(store.launchReady ? { allow: '/' } : { disallow: '/' }) }, ...(store.launchReady ? { sitemap: new URL('/sitemap.xml', store.siteUrl).href } : {}) };
}
