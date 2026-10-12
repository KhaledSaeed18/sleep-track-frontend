import type { Metadata } from 'next';
import { SecuritySection } from '@/features/account/components/security-section';

export const metadata: Metadata = { title: 'Security' };

export default function Page() {
  return <SecuritySection />;
}
