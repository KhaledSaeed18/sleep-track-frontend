import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register', '/privacy', '/terms'],
        disallow: [
          '/api/',
          '/dashboard',
          '/journal',
          '/analytics',
          '/insights',
          '/reports',
          '/goals',
          '/tags',
          '/settings',
          '/admin',
          '/auth/',
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
