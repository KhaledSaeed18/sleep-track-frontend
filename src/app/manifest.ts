import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#0b0f23',
    theme_color: '#12172f',
    categories: ['health', 'lifestyle', 'productivity'],
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/icons/192', type: 'image/png', sizes: '192x192' },
      { src: '/icons/512', type: 'image/png', sizes: '512x512' },
      { src: '/icons/512', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
    ],
  };
}
