import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminView } from '@/features/admin/components/admin-view';

export const metadata: Metadata = { title: 'Admin' };

export default function AdminPage() {
  return (
    <Suspense>
      <AdminView />
    </Suspense>
  );
}
