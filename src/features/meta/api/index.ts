import { useQuery } from '@tanstack/react-query';
import { api, unwrap } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { AppMeta } from '@/types/models';

export const metaApi = {
  get: () => unwrap(api.GET('/api/v1/meta')),
};

const FALLBACK_META: AppMeta = {
  name: 'SleepTrack',
  version: '2.0.0',
  environment: 'unknown',
  features: {
    google_oauth: false,
    demo_mode: true,
    email_verification_required: false,
    registration_open: true,
  },
};

export function useAppMeta() {
  return useQuery({
    queryKey: queryKeys.meta,
    queryFn: metaApi.get,
    staleTime: 10 * 60_000,
    meta: { silent: true },
    placeholderData: FALLBACK_META,
  });
}
