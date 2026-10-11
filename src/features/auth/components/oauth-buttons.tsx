'use client';

import { useAppMeta } from '@/features/meta/api';
import { authApi } from '../api';
import { useOAuthProviders } from '../hooks/use-auth';

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.8-3.8H1.2v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.2 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.2 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8Z"
      />
    </svg>
  );
}

/** Third-party sign-in buttons, rendered only for providers the API reports as enabled. */
export function OAuthButtons({ next }: { next?: string | null }) {
  const { data: providers } = useOAuthProviders();
  const { data: meta } = useAppMeta();
  const google = providers?.find((provider) => provider.id === 'google' && provider.enabled);
  if (!google || meta?.features.google_oauth === false) return null;

  return (
    <>
      <a
        href={authApi.oauthAuthorizeUrl('google', next ?? '/dashboard')}
        className="btn w-full gap-2 border-(--hairline) btn-outline font-medium"
      >
        <GoogleGlyph />
        Continue with {google.name}
      </a>
      <div className="divider my-5 text-xs text-base-content/50">or use your email</div>
    </>
  );
}
