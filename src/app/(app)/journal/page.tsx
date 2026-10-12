import type { Metadata } from 'next';
import { Suspense } from 'react';
import { JournalView } from '@/features/sessions/components/journal/journal-view';

export const metadata: Metadata = { title: 'Sleep journal' };

export default function JournalPage() {
  return (
    <Suspense>
      <JournalView />
    </Suspense>
  );
}
