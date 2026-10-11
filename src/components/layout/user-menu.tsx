'use client';

import { Keyboard, LogOut, Settings, ShieldCheck, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { useLogout, useUser } from '@/features/auth';
import { useUiStore } from '@/stores/ui-store';

function blurActive() {
  (document.activeElement as HTMLElement | null)?.blur();
}

export function UserMenu() {
  const user = useUser();
  const logout = useLogout();
  const setShortcutsOpen = useUiStore((state) => state.setShortcutsOpen);

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-circle btn-ghost"
        aria-label="Account menu"
      >
        <Avatar
          firstName={user.first_name}
          lastName={user.last_name}
          src={user.avatar_url}
          size="sm"
        />
      </div>
      <div
        tabIndex={-1}
        className="dropdown-content z-50 mt-2 w-64 rounded-box border border-(--hairline) bg-base-100 shadow-xl"
      >
        <div className="flex items-center gap-3 border-b border-(--hairline) p-4">
          <Avatar firstName={user.first_name} lastName={user.last_name} src={user.avatar_url} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.full_name}</p>
            <p className="truncate text-sm text-base-content/60">{user.email}</p>
          </div>
        </div>
        <ul className="menu w-full p-1.5">
          <li>
            <Link href="/settings" onClick={blurActive}>
              <UserIcon className="size-4" aria-hidden="true" /> Profile
            </Link>
          </li>
          <li>
            <Link href="/settings/preferences" onClick={blurActive}>
              <Settings className="size-4" aria-hidden="true" /> Preferences
            </Link>
          </li>
          {user.role === 'admin' && (
            <li>
              <Link href="/admin" onClick={blurActive}>
                <ShieldCheck className="size-4" aria-hidden="true" /> Admin
              </Link>
            </li>
          )}
          <li>
            <button
              type="button"
              onClick={() => {
                blurActive();
                setShortcutsOpen(true);
              }}
            >
              <Keyboard className="size-4" aria-hidden="true" /> Keyboard shortcuts
              <kbd className="ml-auto kbd kbd-xs">?</kbd>
            </button>
          </li>
        </ul>
        <div className="border-t border-(--hairline) p-1.5">
          <ul className="menu w-full p-0">
            <li>
              <button type="button" onClick={() => logout.mutate()} disabled={logout.isPending}>
                <LogOut className="size-4" aria-hidden="true" /> Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
