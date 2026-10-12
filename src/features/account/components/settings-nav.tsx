'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SETTINGS_SECTIONS } from '@/config/nav';
import { cn } from '@/lib/utils';

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Settings sections"
      className="tabs tabs-border mb-6 flex-nowrap overflow-x-auto"
    >
      {SETTINGS_SECTIONS.map((section) => {
        const active = pathname === section.href;
        return (
          <Link
            key={section.href}
            href={section.href}
            className={cn('tab whitespace-nowrap', active && 'tab-active')}
            aria-current={active ? 'page' : undefined}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
