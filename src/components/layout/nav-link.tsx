'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/config/nav';
import { cn } from '@/lib/utils';

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group relative gap-3 rounded-field py-2.5',
          active
            ? 'menu-active bg-primary/12! font-semibold text-base-content!'
            : 'text-base-content/75 hover:text-base-content',
          collapsed && 'tooltip tooltip-right justify-center px-0',
        )}
        data-tip={collapsed ? item.label : undefined}
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 -left-3 w-1 rounded-r-full bg-primary"
          />
        )}
        <Icon
          className={cn('size-[1.15rem] shrink-0', active ? 'text-primary' : 'opacity-80')}
          aria-hidden="true"
        />
        <span className={cn(collapsed && 'sr-only')}>{item.label}</span>
      </Link>
    </li>
  );
}
