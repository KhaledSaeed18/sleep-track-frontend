import type { Metadata } from 'next';
import { PreferencesForm } from '@/features/account/components/preferences-form';

export const metadata: Metadata = { title: 'Preferences' };

export default function Page() {
  return <PreferencesForm />;
}
