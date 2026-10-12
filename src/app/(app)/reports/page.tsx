import type { Metadata } from 'next';
import { Suspense } from 'react';
import { WeeklyReportView } from '@/features/reports/components/weekly-report-view';

export const metadata: Metadata = { title: 'Weekly report' };

export default function Page() {
  return (
    <Suspense>
      <WeeklyReportView />
    </Suspense>
  );
}
