import type { Metadata } from 'next';
import { GoalsView } from '@/features/goals/components/goals-view';

export const metadata: Metadata = { title: 'Goals' };

export default function Page() {
  return <GoalsView />;
}
