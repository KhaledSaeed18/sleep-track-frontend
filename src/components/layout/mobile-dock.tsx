'use client';

import { BarChart3, LayoutDashboard, MoreHorizontal, NotebookPen, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';
import { isActivePath } from './nav-link';

const ITEMS = [
  { href: '/dashboard', label: 'Today', icon: LayoutDashboard },
  { href: '/journal', label: 'Journal', icon: NotebookPen },
  { href: '/analytics', label: 'Trends', icon: BarChart3 },
] as const;

export function MobileDock({ drawerId }: { drawerId: string }) {
  const pathname = usePathname();
  const openEditor = useUiStore((state) => state.openSessionEditor);

  return (
    <nav
      className="dock z-40 dock-md border-t border-(--hairline) bg-base-100/95 backdrop-blur-md lg:hidden"
      aria-label="Quick navigation"
    >
      {ITEMS.slice(0, 2).map((item) => (
        <DockLink key={item.href} {...item} active={isActivePath(pathname, item.href)} />
      ))}
      <button type="button" onClick={() => openEditor({ mode: 'create' })} aria-label="Log a night">
        <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-content shadow-lg">
          <Plus className="size-5" aria-hidden="true" />
        </span>
      </button>
      <DockLink {...ITEMS[2]} active={isActivePath(pathname, ITEMS[2].href)} />
      <label htmlFor={drawerId} className="cursor-pointer">
        <MoreHorizontal className="size-5" aria-hidden="true" />
        <span className="dock-label">More</span>
      </label>
    </nav>
  );
}

function DockLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Plus;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(active && 'dock-active text-primary')}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="size-5" aria-hidden="true" />
      <span className="dock-label">{label}</span>
    </Link>
  );
}
