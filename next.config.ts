import type { NextConfig } from 'next';

const apiInternalUrl = (process.env.API_INTERNAL_URL ?? 'http://localhost:8000').replace(/\/$/, '');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  poweredByHeader: false,
  agentRules: false,
  turbopack: {
    resolveAlias: {
      // `msw/browser` is unavailable under the `node` condition, so the SSR pass of client
      // components gets a stub. Only used when NEXT_PUBLIC_API_MOCKING is enabled.
      'msw/browser': {
        browser: './node_modules/msw/lib/browser/index.js',
        default: './src/mocks/worker-stub.ts',
      },
    },
  },
  typedRoutes: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  async redirects() {
    // Transactional emails link to /auth/<page>; the pages live at the top level.
    return [
      {
        source: '/auth/:page(verify-email|reset-password|forgot-password|login|register)',
        destination: '/:page',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiInternalUrl}/api/:path*` }];
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
