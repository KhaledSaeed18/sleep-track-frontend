import type { Metadata } from 'next';
import { DashboardView } from '@/features/analytics/components/dashboard/dashboard-view';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return <DashboardView />;
}
