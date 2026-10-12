'use client';

import { Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo';
import { useMounted } from '@/hooks/use-mounted';
import { useUiStore } from '@/stores/ui-store';
import { ThemeToggle } from './theme-toggle';
import { TimerIndicator } from './timer-indicator';
import { UserMenu } from './user-menu';

function useModKey() {
  const mounted = useMounted();
  if (!mounted) return '⌘';
  return /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';
}

export function Topbar({ drawerId }: { drawerId: string }) {
  const openPalette = useUiStore((state) => state.setCommandPaletteOpen);
  const mod = useModKey();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-(--hairline) bg-base-200/80 px-4 backdrop-blur-md sm:px-6 print:hidden">
      <label
        htmlFor={drawerId}
        className="btn btn-square btn-ghost btn-sm lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" aria-hidden="true" />
      </label>
      <Link href="/dashboard" className="lg:hidden" aria-label="SleepTrack dashboard">
        <LogoMark className="size-7" />
      </Link>

      <button
        type="button"
        onClick={() => openPalette(true)}
        className="ml-auto hidden h-9 w-full max-w-sm items-center gap-2 rounded-field border border-(--hairline) bg-base-100 px-3 text-sm text-base-content/55 transition-colors hover:text-base-content/80 sm:flex lg:ml-0"
        aria-label="Search and run commands"
      >
        <Search className="size-4" aria-hidden="true" />
        <span>Search or jump to…</span>
        <span className="ml-auto flex gap-1" aria-hidden="true">
          <kbd className="kbd kbd-xs">{mod}</kbd>
          <kbd className="kbd kbd-xs">K</kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => openPalette(true)}
          className="btn btn-square btn-ghost btn-sm sm:hidden"
          aria-label="Search and run commands"
        >
          <Search className="size-4" aria-hidden="true" />
        </button>
        <TimerIndicator />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
