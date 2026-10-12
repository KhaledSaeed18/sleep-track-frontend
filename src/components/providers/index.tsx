'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { useState, type ReactNode } from 'react';
import { AuthProvider } from '@/features/auth';
import { createQueryClient } from '@/lib/query-client';
import { MockGate } from './mock-gate';
import { ThemeSync } from './theme-sync';
import { Toaster } from './toaster';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <ThemeSync />
        <MockGate>
          <AuthProvider>{children}</AuthProvider>
        </MockGate>
        <Toaster />
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
