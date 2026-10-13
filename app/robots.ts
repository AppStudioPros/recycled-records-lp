import type { MetadataRoute } from 'next';
import { store } from '@/lib/store';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', ...(store.launchReady ? { allow: '/' } : { disallow: '/' }) },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'Googlebot-Extended', allow: '/' },
    ],
    ...(store.launchReady ? { sitemap: new URL('/sitemap.xml', store.siteUrl).href } : {}),
  };
}
