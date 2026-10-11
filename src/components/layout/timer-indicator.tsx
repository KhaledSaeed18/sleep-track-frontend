'use client';

import { Moon, Play } from 'lucide-react';
import Link from 'next/link';
import { useStartTimer, useTimer } from '@/features/timer/hooks';
import { useNow } from '@/hooks/use-now';
import { formatDuration } from '@/lib/format';
import { cn } from '@/lib/utils';

function useElapsedMinutes(startedAt: string | undefined) {
  const now = useNow(30_000, !!startedAt);
  if (!startedAt) return 0;
  return Math.max(0, Math.floor((now - Date.parse(startedAt)) / 60_000));
}

/** Compact live indicator for the top bar while a sleep timer is running. */
export function TimerIndicator() {
  const { data } = useTimer();
  const session = data?.active ? data.session : null;
  const elapsed = useElapsedMinutes(session?.started_at);
  if (!session) return null;
  return (
    <Link
      href="/dashboard#timer"
      className="btn gap-2 rounded-full border-accent/30 bg-accent/10 text-base-content btn-sm hover:bg-accent/20"
      aria-label={`Sleep timer running for ${formatDuration(elapsed)}`}
    >
      <span className="status animate-pulse status-warning" aria-hidden="true" />
      <span className="tabular">{formatDuration(elapsed)}</span>
    </Link>
  );
}

export function SidebarTimer({ collapsed }: { collapsed: boolean }) {
  const { data, isPending } = useTimer();
  const start = useStartTimer();
  const session = data?.active ? data.session : null;
  const elapsed = useElapsedMinutes(session?.started_at);

  if (isPending) return null;

  if (session) {
    return (
      <Link
        href="/dashboard#timer"
        className={cn(
          'flex items-center gap-3 rounded-field border border-accent/25 bg-accent/10 p-2.5 transition-colors hover:bg-accent/15',
          collapsed && 'tooltip tooltip-right justify-center',
        )}
        data-tip={collapsed ? `Asleep for ${formatDuration(elapsed)}` : undefined}
      >
        <Moon className="size-4 shrink-0 text-accent" aria-hidden="true" />
        <span className={cn('min-w-0 text-sm', collapsed && 'sr-only')}>
          <span className="block font-medium">Timer running</span>
          <span className="tabular block text-xs text-base-content/65">
            {formatDuration(elapsed)} so far
          </span>
        </span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => start.mutate({})}
      disabled={start.isPending}
      className={cn(
        'btn w-full justify-start gap-2 btn-ghost btn-sm',
        collapsed && 'tooltip tooltip-right justify-center',
      )}
      data-tip={collapsed ? 'Start sleep timer' : undefined}
    >
      {start.isPending ? (
        <span className="loading loading-xs loading-spinner" />
      ) : (
        <Play className="size-4" aria-hidden="true" />
      )}
      <span className={cn(collapsed && 'sr-only')}>Start sleep timer</span>
    </button>
  );
}
