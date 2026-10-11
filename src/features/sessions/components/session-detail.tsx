'use client';

import { ArrowLeft, BedDouble, Pencil, Sunrise, Trash2, Moon, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { NightArc } from '@/components/brand/night-arc';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Rating } from '@/components/ui/rating';
import { ScoreRing } from '@/components/ui/score-ring';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useGoal } from '@/features/goals/hooks';
import { TagChip } from '@/features/tags/components/tag-chip';
import { useFormatters } from '@/hooks/use-preferences';
import { isApiError } from '@/lib/api/errors';
import { MOOD_LABELS, QUALITY_LABELS, formatDuration, scoreLabel } from '@/lib/format';
import { useUiStore } from '@/stores/ui-store';
import { useDeleteSession, useSession } from '../hooks';

const SOURCE_LABELS = {
  manual: 'Logged by hand',
  timer: 'Sleep timer',
  import: 'Imported',
} as const;

function Metric({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="surface p-4">
      <p className="text-sm text-base-content/55">{label}</p>
      <div className="mt-1.5 text-lg font-semibold">{children}</div>
    </div>
  );
}

export function SessionDetail({ id }: { id: string }) {
  const fmt = useFormatters();
  const router = useRouter();
  const session = useSession(id);
  const goal = useGoal();
  const remove = useDeleteSession();
  const openEditor = useUiStore((state) => state.openSessionEditor);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const back = (
    <Link href="/journal" className="btn -ml-3 gap-1.5 btn-ghost btn-sm">
      <ArrowLeft className="size-4" aria-hidden="true" /> Journal
    </Link>
  );

  if (session.isPending) {
    return (
      <div className="space-y-6">
        {back}
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (session.isError) {
    if (isApiError(session.error) && session.error.status === 404) {
      return (
        <div className="space-y-6">
          {back}
          <EmptyState
            icon={FileQuestion}
            title="This night is not in your journal"
            description="It may have been deleted, or the link is wrong."
            action={
              <Link href="/journal" className="btn btn-primary btn-sm">
                Back to journal
              </Link>
            }
          />
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {back}
        <ErrorState error={session.error} onRetry={() => void session.refetch()} />
      </div>
    );
  }

  const s = session.data;
  const target = goal.data?.target_duration_minutes ?? 480;
  const asleepAt =
    s.sleep_latency_minutes !== null
      ? new Date(Date.parse(s.started_at) + s.sleep_latency_minutes * 60_000)
      : null;

  return (
    <article className="space-y-6">
      {back}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-base-content/60">
            {s.status === 'in_progress' ? 'In progress' : SOURCE_LABELS[s.source]}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Night of {fmt.localDate(s.night_of, 'EEEE, MMMM d')}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn"
            onClick={() => openEditor({ mode: 'edit', sessionId: s.id })}
            disabled={s.status === 'in_progress'}
          >
            <Pencil className="size-4" aria-hidden="true" /> Edit
          </button>
          <button
            type="button"
            className="btn btn-ghost text-error"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" /> Delete
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section
          className="surface sky-gradient overflow-hidden px-6 pt-8 pb-5"
          aria-label="Night overview"
        >
          <NightArc
            progress={1}
            fill={Math.min(1, (s.duration_minutes ?? 0) / target)}
            startLabel={`In bed ${fmt.time(s.started_at)}`}
            endLabel={s.ended_at ? `Up ${fmt.time(s.ended_at)}` : 'Still asleep'}
            className="mx-auto max-w-md"
          >
            <span className="text-6xl font-semibold tracking-tight">
              {formatDuration(s.duration_minutes)}
            </span>
            <span className="mt-1 text-sm text-base-content/60">
              asleep, goal {formatDuration(target)}
            </span>
          </NightArc>
        </section>

        <section
          className="surface flex flex-col items-center justify-center gap-3 p-6 text-center"
          aria-label="Sleep score"
        >
          <ScoreRing value={s.score} size="8.5rem" thickness="0.6rem">
            <span className="text-4xl font-semibold">{s.score ?? '—'}</span>
          </ScoreRing>
          <p className="text-lg font-semibold">{scoreLabel(s.score)}</p>
          <div className="collapse-arrow collapse w-full rounded-field bg-base-200/60 text-left">
            <input type="checkbox" aria-label="How the score is calculated" />
            <div className="collapse-title text-sm font-medium">How the score is calculated</div>
            <div className="collapse-content text-sm text-base-content/70">
              <p>
                Duration against your goal counts for 40%, quality 25%, time to fall asleep 15%,
                awakenings 10% and bedtime against your goal window 10%. Anything you leave blank is
                left out and the rest is re-weighted.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="surface p-6" aria-labelledby="timeline-title">
        <h2 id="timeline-title" className="mb-4 text-base font-semibold">
          Timeline
        </h2>
        <ul className="timeline timeline-vertical sm:timeline-horizontal">
          <li className="grow">
            <div className="timeline-start text-sm text-base-content/60">In bed</div>
            <div className="timeline-middle text-secondary">
              <BedDouble className="size-5" aria-hidden="true" />
            </div>
            <div className="tabular timeline-end timeline-box">{fmt.time(s.started_at)}</div>
            <hr className="bg-base-300" />
          </li>
          {asleepAt && (
            <li className="grow">
              <hr className="bg-base-300" />
              <div className="timeline-start text-sm text-base-content/60">Fell asleep</div>
              <div className="timeline-middle text-primary">
                <Moon className="size-5" aria-hidden="true" />
              </div>
              <div className="tabular timeline-end timeline-box">{fmt.time(asleepAt)}</div>
              <hr className="bg-base-300" />
            </li>
          )}
          <li className="grow">
            <hr className="bg-base-300" />
            <div className="timeline-start text-sm text-base-content/60">Woke up</div>
            <div className="timeline-middle text-accent">
              <Sunrise className="size-5" aria-hidden="true" />
            </div>
            <div className="tabular timeline-end timeline-box">
              {s.ended_at ? fmt.time(s.ended_at) : 'Not yet'}
            </div>
          </li>
        </ul>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="Quality">
          <div className="flex items-center gap-2">
            <Rating value={s.quality} label="Quality" size="sm" />
            <span className="text-sm font-normal text-base-content/70">
              {s.quality ? QUALITY_LABELS[s.quality] : 'Not rated'}
            </span>
          </div>
        </Metric>
        <Metric label="Mood on waking">{s.mood_on_wake ? MOOD_LABELS[s.mood_on_wake] : '—'}</Metric>
        <Metric label="Time to fall asleep">
          {s.sleep_latency_minutes === null ? '—' : `${String(s.sleep_latency_minutes)} min`}
        </Metric>
        <Metric label="Times you woke up">{s.awakenings ?? '—'}</Metric>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface p-6">
          <h2 className="mb-3 text-base font-semibold">Tags</h2>
          {s.tags.length ? (
            <div className="flex flex-wrap gap-2">
              {s.tags.map((tag) => (
                <TagChip key={tag.id} tag={tag} size="md" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-base-content/60">No tags on this night.</p>
          )}
        </section>
        <section className="surface p-6">
          <h2 className="mb-3 text-base font-semibold">Notes</h2>
          {s.notes ? (
            <p className="whitespace-pre-wrap">{s.notes}</p>
          ) : (
            <p className="text-sm text-base-content/60">No notes for this night.</p>
          )}
        </section>
      </div>

      <p className="text-xs text-base-content/50">
        Recorded in {s.timezone.replace(/_/g, ' ')}. Last updated {fmt.dateTime(s.updated_at)}.
      </p>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this night?"
        description="It will be removed from your journal and stats. This cannot be undone."
        confirmLabel="Delete night"
        tone="error"
        pending={remove.isPending}
        onConfirm={() => remove.mutate(s.id, { onSuccess: () => router.replace('/journal') })}
      />
    </article>
  );
}
