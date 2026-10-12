import type { ReactNode } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { SettingsNav } from '@/features/account/components/settings-nav';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Settings"
        description="Manage your profile, preferences, security and data."
      />
      <SettingsNav />
      {children}
    </div>
  );
}
