import type { Metadata } from 'next';
import { DataSection } from '@/features/account/components/data-section';

export const metadata: Metadata = { title: 'Your data' };

export default function Page() {
  return <DataSection />;
}
