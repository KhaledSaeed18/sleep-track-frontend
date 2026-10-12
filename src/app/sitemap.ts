import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-10-12');
  return [
    { url: `${siteConfig.url}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteConfig.url}/register`, lastModified, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${siteConfig.url}/login`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${siteConfig.url}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteConfig.url}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
