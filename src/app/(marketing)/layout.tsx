import type { ReactNode } from 'react';
import { SiteFooter } from '@/features/marketing/components/site-footer';
import { SiteHeader } from '@/features/marketing/components/site-header';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
