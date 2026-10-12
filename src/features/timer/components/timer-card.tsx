'use client';

import { Clock3, Moon, Sunrise, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { NightArc } from '@/components/brand/night-arc';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/states';
import { useGoal } from '@/features/goals/hooks';
import { useFormatters } from '@/hooks/use-preferences';
import { useNow } from '@/hooks/use-now';
import { fromDateTimeInput, toDateTimeInput } from '@/lib/date';
import { formatDuration } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useCancelTimer, useStartTimer, useTimer } from '../hooks';
import { TimerStopDialog } from './timer-stop-dialog';

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function Elapsed({ seconds }: { seconds: number }) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return (
    <span
      className="tabular text-5xl font-semibold tracking-tight"
      aria-label={`${String(h)} hours ${String(m)} minutes`}
    >
      {h}:{pad(m)}
      <span className="text-2xl text-base-content/45">:{pad(s)}</span>
    </span>
  );
}

export function TimerCard({ className }: { className?: string }) {
  const fmt = useFormatters();
  const { data, isPending } = useTimer();
  const goal = useGoal();
  const start = useStartTimer();
  const cancel = useCancelTimer();
  const session = data?.active ? data.session : null;
  const now = useNow(1000, !!session);
  const [stopOpen, setStopOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [backdate, setBackdate] = useState<string | null>(null);

  const target = goal.data?.target_duration_minutes ?? 480;
  const elapsedSeconds = session
    ? Math.max(0, Math.floor((now - Date.parse(session.started_at)) / 1000))
    : 0;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const progress = session ? Math.min(1, elapsedMinutes / target) : null;

  return (
    <section
      id="timer"
      className={cn('surface relative flex scroll-mt-24 flex-col overflow-hidden', className)}
      aria-labelledby="timer-title"
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700',
          session && 'sky-gradient opacity-100',
        )}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h2 id="timer-title" className="text-base font-semibold">
            Sleep timer
          </h2>
          <p className="mt-0.5 text-sm text-base-content/60">
            {session
              ? `Started at ${fmt.time(session.started_at)}`
              : 'Tap when you go to bed, and again when you wake.'}
          </p>
        </div>
        {session && (
          <span className="badge gap-1.5 badge-soft badge-warning">
            <span className="status animate-pulse status-warning" aria-hidden="true" /> Running
          </span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col justify-end px-5 pt-4 pb-5">
        {isPending ? (
          <Skeleton className="h-40 w-full" />
        ) : session ? (
          <>
            <NightArc
              progress={progress}
              live
              startLabel={fmt.time(session.started_at)}
              endLabel={`Goal ${formatDuration(target)}`}
              className="mx-auto max-w-[17rem]"
            >
              <Elapsed seconds={elapsedSeconds} />
            </NightArc>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="btn flex-1 btn-primary"
                onClick={() => setStopOpen(true)}
              >
                <Sunrise className="size-4" aria-hidden="true" /> I am awake
              </button>
              <button
                type="button"
                className="btn btn-square btn-ghost"
                onClick={() => setCancelOpen(true)}
                aria-label="Discard timer"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4 text-center">
              <span className="grid size-20 place-items-center rounded-full bg-secondary/10 text-secondary">
                <Moon className="size-9" aria-hidden="true" />
              </span>
              {goal.data && (
                <p className="text-sm text-base-content/60">
                  Your goal bedtime is{' '}
                  <span className="font-medium text-base-content">
                    {fmt.clock(goal.data.target_bedtime)}
                  </span>
                </p>
              )}
            </div>
            {backdate !== null ? (
              <div className="mb-3">
                <label htmlFor="timer-backdate" className="field-label">
                  When did you go to bed?
                </label>
                <input
                  id="timer-backdate"
                  type="datetime-local"
                  className="input w-full"
                  value={backdate}
                  max={toDateTimeInput(new Date(), fmt.zone)}
                  onChange={(event) => setBackdate(event.target.value)}
                />
              </div>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                className="btn flex-1 btn-secondary"
                disabled={start.isPending}
                onClick={() =>
                  start.mutate(
                    {
                      timezone: fmt.zone,
                      ...(backdate ? { started_at: fromDateTimeInput(backdate, fmt.zone) } : {}),
                    },
                    { onSuccess: () => setBackdate(null) },
                  )
                }
              >
                {start.isPending ? (
                  <span className="loading loading-sm loading-spinner" aria-hidden="true" />
                ) : (
                  <Moon className="size-4" aria-hidden="true" />
                )}
                {backdate ? 'Start from this time' : 'Going to sleep'}
              </button>
              <button
                type="button"
                className={cn(
                  'tooltip btn btn-square btn-ghost',
                  backdate !== null && 'btn-active',
                )}
                data-tip={backdate !== null ? 'Start now instead' : 'Started earlier?'}
                aria-label={backdate !== null ? 'Start now instead' : 'Set an earlier start time'}
                onClick={() =>
                  setBackdate(
                    backdate === null
                      ? toDateTimeInput(new Date(Date.now() - 15 * 60_000), fmt.zone)
                      : null,
                  )
                }
              >
                <Clock3 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </div>

      <TimerStopDialog
        open={stopOpen}
        onClose={() => setStopOpen(false)}
        elapsedMinutes={elapsedMinutes}
      />
      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Discard this timer?"
        description="The running session will be removed and nothing will be logged."
        confirmLabel="Discard timer"
        tone="error"
        pending={cancel.isPending}
        onConfirm={() => cancel.mutate(undefined, { onSuccess: () => setCancelOpen(false) })}
      />
    </section>
  );
}
