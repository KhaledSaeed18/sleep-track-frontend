import type { Metadata } from 'next';
import { SessionDetail } from '@/features/sessions/components/session-detail';

export const metadata: Metadata = { title: 'Night details' };

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SessionDetail id={id} />;
}
