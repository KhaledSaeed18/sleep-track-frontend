'use client';

import Link from 'next/link';
import { Rating } from '@/components/ui/rating';
import { TagChip } from '@/features/tags/components/tag-chip';
import { useFormatters } from '@/hooks/use-preferences';
import { formatDuration, scoreTone } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { SleepSession } from '@/types/models';
import { SessionActions } from './session-actions';

const TONE = {
  success: 'badge-success',
  primary: 'badge-primary',
  warning: 'badge-warning',
  error: 'badge-error',
  neutral: 'badge-ghost',
} as const;

interface SessionsTableProps {
  sessions: SleepSession[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onDelete: (session: SleepSession) => void;
  busy?: boolean;
}

function ScoreBadge({ score }: { score: number | null }) {
  return (
    <span
      className={cn('tabular badge w-10 badge-soft badge-sm font-semibold', TONE[scoreTone(score)])}
      aria-label={`Score ${String(score ?? 'none')}`}
    >
      {score ?? '—'}
    </span>
  );
}

function TagList({ session, max = 3 }: { session: SleepSession; max?: number }) {
  if (!session.tags.length) return <span className="text-base-content/35">—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {session.tags.slice(0, max).map((tag) => (
        <TagChip key={tag.id} tag={tag} size="xs" />
      ))}
      {session.tags.length > max && (
        <span className="badge badge-ghost badge-xs">+{session.tags.length - max}</span>
      )}
    </span>
  );
}

export function SessionsTable({
  sessions,
  selected,
  onToggle,
  onToggleAll,
  onDelete,
  busy = false,
}: SessionsTableProps) {
  const fmt = useFormatters();
  const currentYear = String(new Date().getFullYear());
  const allSelected = sessions.length > 0 && sessions.every((session) => selected.has(session.id));
  const someSelected = !allSelected && sessions.some((session) => selected.has(session.id));

  return (
    <div className={cn('transition-opacity', busy && 'opacity-60')}>
      <div className="hidden overflow-x-auto md:block">
        <table className="table">
          <thead>
            <tr className="text-base-content/60">
              <th className="w-10">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={onToggleAll}
                  aria-label="Select all nights on this page"
                />
              </th>
              <th scope="col">Night</th>
              <th scope="col">Asleep</th>
              <th scope="col">Duration</th>
              <th scope="col">Score</th>
              <th scope="col">Quality</th>
              <th scope="col">Tags</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const label = fmt.localDate(session.night_of, 'EEEE, MMM d');
              const checked = selected.has(session.id);
              return (
                <tr
                  key={session.id}
                  className={cn('hover:bg-base-200/60', checked && 'bg-primary/5')}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={checked}
                      onChange={() => onToggle(session.id)}
                      aria-label={`Select ${label}`}
                    />
                  </td>
                  <td>
                    <Link href={`/journal/${session.id}`} className="font-medium link-hover">
                      {fmt.localDate(session.night_of, 'EEE, MMM d')}
                    </Link>
                    {!session.night_of.startsWith(currentYear) && (
                      <div className="text-xs text-base-content/50">
                        {fmt.localDate(session.night_of, 'yyyy')}
                      </div>
                    )}
                  </td>
                  <td className="tabular whitespace-nowrap text-base-content/75">
                    {fmt.time(session.started_at)} –{' '}
                    {session.ended_at ? fmt.time(session.ended_at) : 'now'}
                  </td>
                  <td className="tabular font-medium">
                    {formatDuration(session.duration_minutes)}
                  </td>
                  <td>
                    <ScoreBadge score={session.score} />
                  </td>
                  <td>
                    <Rating value={session.quality} label="Quality" size="xs" />
                  </td>
                  <td className="max-w-56">
                    <TagList session={session} />
                  </td>
                  <td className="text-right">
                    <SessionActions
                      id={session.id}
                      label={label}
                      onDelete={() => onDelete(session)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-(--hairline) md:hidden">
        {sessions.map((session) => {
          const label = fmt.localDate(session.night_of, 'EEEE, MMM d');
          const checked = selected.has(session.id);
          return (
            <li
              key={session.id}
              className={cn('flex items-start gap-3 px-4 py-3.5', checked && 'bg-primary/5')}
            >
              <input
                type="checkbox"
                className="checkbox mt-1 checkbox-sm"
                checked={checked}
                onChange={() => onToggle(session.id)}
                aria-label={`Select ${label}`}
              />
              <Link href={`/journal/${session.id}`} className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{label}</span>
                  <ScoreBadge score={session.score} />
                </div>
                <div className="tabular mt-0.5 flex items-center gap-2 text-sm text-base-content/60">
                  <span>{formatDuration(session.duration_minutes)}</span>
                  <span aria-hidden="true">/</span>
                  <span>
                    {fmt.time(session.started_at)} –{' '}
                    {session.ended_at ? fmt.time(session.ended_at) : 'now'}
                  </span>
                </div>
                <div className="mt-2">
                  <TagList session={session} max={4} />
                </div>
              </Link>
              <SessionActions id={session.id} label={label} onDelete={() => onDelete(session)} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
