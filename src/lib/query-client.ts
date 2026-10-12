import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/errors';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { silent?: boolean; successMessage?: string };
    queryMeta: { silent?: boolean };
  }
}

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isApiError(error) && error.status >= 400 && error.status < 500 && error.status !== 429)
    return false;
  return failureCount < 2;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.silent || query.state.data === undefined) return;
        // Background refetch failed while stale data is on screen.
        if (isApiError(error) && error.code !== 'not_authenticated')
          toast.error(error.friendlyMessage, { id: 'query-error' });
      },
    }),
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        const message = mutation.meta?.successMessage;
        if (message) toast.success(message);
      },
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.silent) return;
        toast.error(isApiError(error) ? error.friendlyMessage : 'Something went wrong. Try again.');
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        refetchOnWindowFocus: true,
      },
      mutations: { retry: false },
    },
  });
}
