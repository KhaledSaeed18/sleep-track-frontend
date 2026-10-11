'use client';

import { ChevronRight, NotebookPen } from 'lucide-react';
import Link from 'next/link';
import { SectionCard } from '@/components/ui/page-header';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { useRecentSessions } from '@/features/sessions/hooks';
import { useFormatters } from '@/hooks/use-preferences';
import { formatDuration, scoreTone } from '@/lib/format';
import { cn } from '@/lib/utils';

const TONE = {
  success: 'badge-success',
  primary: 'badge-primary',
  warning: 'badge-warning',
  error: 'badge-error',
  neutral: 'badge-ghost',
} as const;

export function RecentNights({ className }: { className?: string }) {
  const fmt = useFormatters();
  const { data, isPending } = useRecentSessions(6);
  return (
    <SectionCard
      title="Recent nights"
      className={className}
      bodyClassName="px-2 pt-2 pb-3"
      action={
        <Link href="/journal" className="link text-sm text-base-content/60 link-hover">
          Open journal
        </Link>
      }
    >
      {isPending ? (
        <div className="space-y-2 px-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-11" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <EmptyState
          compact
          icon={NotebookPen}
          title="No nights yet"
          description="Nights you log will show up here."
        />
      ) : (
        <ul className="menu w-full p-0">
          {data.items.map((session) => (
            <li key={session.id}>
              <Link href={`/journal/${session.id}`} className="flex items-center gap-3 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {fmt.localDate(session.night_of, 'EEEE, MMM d')}
                  </span>
                  <span className="tabular block text-xs text-base-content/55">
                    {fmt.time(session.started_at)} to{' '}
                    {session.ended_at ? fmt.time(session.ended_at) : 'now'}
                  </span>
                </span>
                <span className="tabular text-sm font-medium">
                  {formatDuration(session.duration_minutes)}
                </span>
                <span
                  className={cn(
                    'tabular badge w-10 badge-soft badge-sm',
                    TONE[scoreTone(session.score)],
                  )}
                  aria-label={`Score ${String(session.score ?? 'none')}`}
                >
                  {session.score ?? '—'}
                </span>
                <ChevronRight className="size-4 text-base-content/35" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
