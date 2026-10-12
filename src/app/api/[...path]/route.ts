import { proxyToApi } from '@/lib/api/upstream-proxy';

// Same-origin gateway to the API: keeps auth cookies first-party and forwards the client address.
export const dynamic = 'force-dynamic';

export {
  proxyToApi as GET,
  proxyToApi as POST,
  proxyToApi as PUT,
  proxyToApi as PATCH,
  proxyToApi as DELETE,
  proxyToApi as HEAD,
  proxyToApi as OPTIONS,
};
