'use client';

import { ChevronsLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { NAV_GROUPS } from '@/config/nav';
import { useUser } from '@/features/auth';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';
import { SidebarLink } from './nav-link';
import { SidebarTimer } from './timer-indicator';

export function Sidebar({
  onNavigate,
  mobile = false,
}: {
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const user = useUser();
  const storedCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const collapsed = !mobile && storedCollapsed;
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const openEditor = useUiStore((state) => state.openSessionEditor);

  return (
    <aside
      className={cn(
        'flex h-dvh flex-col border-r border-(--hairline) bg-base-100 transition-[width] duration-300 ease-(--ease-out-soft)',
        collapsed ? 'w-[4.75rem]' : 'w-[16.5rem]',
      )}
      aria-label="Main"
    >
      <div
        className={cn('flex h-16 shrink-0 items-center px-5', collapsed && 'justify-center px-0')}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          aria-label="SleepTrack dashboard"
          className="rounded-field"
        >
          <Logo compact={collapsed} />
        </Link>
      </div>

      <div className={cn('px-4 pb-2', collapsed && 'px-3')}>
        <button
          type="button"
          className={cn('btn w-full btn-primary', collapsed && 'tooltip tooltip-right btn-square')}
          data-tip={collapsed ? 'Log a night' : undefined}
          onClick={() => {
            openEditor({ mode: 'create' });
            onNavigate?.();
          }}
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className={cn(collapsed && 'sr-only')}>Log a night</span>
        </button>
      </div>

      <nav className="flex-1 scrollbar-thin overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => !item.adminOnly || user.role === 'admin');
          if (!items.length) return null;
          return (
            <div key={group.label} className="mb-4">
              <p
                className={cn(
                  'mb-1 px-3 text-xs font-medium text-base-content/45',
                  collapsed && 'sr-only',
                )}
              >
                {group.label}
              </p>
              <ul className="menu w-full gap-0.5 p-0">
                {items.map((item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className={cn('space-y-2 border-t border-(--hairline) p-3', collapsed && 'px-2')}>
        <SidebarTimer collapsed={collapsed} />
        {!mobile && (
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              'btn w-full justify-start gap-2 btn-ghost text-base-content/60 btn-sm',
              collapsed && 'justify-center',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            <ChevronsLeft
              className={cn('size-4 transition-transform', collapsed && 'rotate-180')}
              aria-hidden="true"
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
