'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, CheckCircle2, Info, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { NightArc } from '@/components/brand/night-arc';
import { TextField } from '@/components/ui/field';
import { PageHeader, SectionCard } from '@/components/ui/page-header';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { FormAlert } from '@/components/ui/form-alert';
import { useUser } from '@/features/auth';
import { useFormatters } from '@/hooks/use-preferences';
import { clockToMinutes, minutesToClock } from '@/lib/date';
import { formatDuration } from '@/lib/format';
import { applyServerErrors } from '@/lib/forms';
import type { Goal } from '@/types/models';
import { useGoal, useUpdateGoal } from '../hooks';
import { goalSchema, type GoalValues } from '../schemas';

const AGE_GROUPS: Record<string, string> = {
  newborn: 'newborns',
  infant: 'infants',
  toddler: 'toddlers',
  preschool: 'preschoolers',
  school_age: 'school-age children',
  teen: 'teenagers',
  young_adult: 'young adults (18 to 25)',
  adult: 'adults (26 to 64)',
  older_adult: 'adults over 65',
};

function spanMinutes(bed: string, wake: string) {
  let span = clockToMinutes(wake) - clockToMinutes(bed);
  if (span <= 0) span += 1440;
  return span;
}

function GoalForm({ goal }: { goal: Goal }) {
  const fmt = useFormatters();
  const user = useUser();
  const update = useUpdateGoal();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<GoalValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      target_duration_minutes: goal.target_duration_minutes,
      target_bedtime: goal.target_bedtime.slice(0, 5),
      target_wake_time: goal.target_wake_time.slice(0, 5),
      bedtime_window_minutes: goal.bedtime_window_minutes,
    },
  });
  const [duration, bedtime, wake] = useWatch({
    control,
    name: ['target_duration_minutes', 'target_bedtime', 'target_wake_time'],
  });
  const { min_hours: minH, max_hours: maxH, age_group: ageGroup } = goal.recommended;
  const inRange = duration >= minH * 60 && duration <= maxH * 60;
  const span = bedtime && wake ? spanMinutes(bedtime, wake) : null;
  const mismatch = span !== null && Math.abs(span - duration) > 30;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = await update.mutateAsync(values);
      reset({
        ...values,
        target_bedtime: saved.target_bedtime.slice(0, 5),
        target_wake_time: saved.target_wake_time.slice(0, 5),
      });
    } catch (error) {
      const message = applyServerErrors(error, setError, [
        'target_duration_minutes',
        'target_bedtime',
        'target_wake_time',
        'bedtime_window_minutes',
      ]);
      if (message) setError('root.server', { message });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <SectionCard
        title="Your targets"
        description="These drive your score, streaks and sleep debt."
      >
        <div className="space-y-7">
          {errors.root?.server && <FormAlert tone="error">{errors.root.server.message}</FormAlert>}
          <Controller
            control={control}
            name="target_duration_minutes"
            render={({ field }) => (
              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="goal-duration" className="field-label">
                    Sleep each night
                  </label>
                  <span className="text-2xl font-semibold">{formatDuration(field.value)}</span>
                </div>
                <input
                  id="goal-duration"
                  type="range"
                  min={300}
                  max={660}
                  step={15}
                  value={field.value}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                  className="range w-full range-primary"
                  aria-valuetext={formatDuration(field.value)}
                />
                <div
                  className="mt-1 flex justify-between text-xs text-base-content/45"
                  aria-hidden="true"
                >
                  <span>5h</span>
                  <span>7h</span>
                  <span>9h</span>
                  <span>11h</span>
                </div>
                {errors.target_duration_minutes && (
                  <p className="field-error">{errors.target_duration_minutes.message}</p>
                )}
              </div>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Bedtime"
              type="time"
              error={errors.target_bedtime?.message}
              {...register('target_bedtime')}
            />
            <TextField
              label="Wake time"
              type="time"
              error={errors.target_wake_time?.message}
              {...register('target_wake_time')}
            />
            <Controller
              control={control}
              name="bedtime_window_minutes"
              render={({ field }) => (
                <div>
                  <label htmlFor="goal-window" className="field-label">
                    Flexibility
                  </label>
                  <select
                    id="goal-window"
                    className="select w-full"
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  >
                    {[15, 30, 45, 60, 90].map((m) => (
                      <option key={m} value={m}>
                        ± {m} min
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />
          </div>
          {mismatch && span !== null && (
            <div role="status" className="alert alert-soft text-sm alert-warning">
              <AlertTriangle className="size-4" aria-hidden="true" />
              <span>
                That schedule gives you {formatDuration(span)} in bed,{' '}
                {span < duration ? 'less' : 'more'} than your {formatDuration(duration)} target.{' '}
                <button
                  type="button"
                  className="link font-medium"
                  onClick={() =>
                    setValue(
                      'target_wake_time',
                      minutesToClock(clockToMinutes(bedtime) + duration),
                      { shouldDirty: true },
                    )
                  }
                >
                  Move wake time to {fmt.clock(minutesToClock(clockToMinutes(bedtime) + duration))}
                </button>
              </span>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!isDirty || isSubmitting}
              onClick={() => reset()}
            >
              Discard
            </button>
            <button type="submit" className="btn btn-primary" disabled={!isDirty || isSubmitting}>
              {isSubmitting && (
                <span className="loading loading-sm loading-spinner" aria-hidden="true" />
              )}
              Save goals
            </button>
          </div>
        </div>
      </SectionCard>

      <div className="space-y-6">
        <section
          className="surface sky-gradient overflow-hidden px-6 pt-6 pb-4"
          aria-label="Goal preview"
        >
          <NightArc
            progress={1}
            fill={Math.min(1, duration / 660)}
            startLabel={`Bed ${fmt.clock(bedtime)}`}
            endLabel={`Up ${fmt.clock(wake)}`}
            className="mx-auto max-w-xs"
          >
            <span className="text-4xl font-semibold">{formatDuration(duration)}</span>
            <span className="text-xs text-base-content/60">nightly goal</span>
          </NightArc>
        </section>

        <SectionCard
          title="Recommended for you"
          description="Based on National Sleep Foundation guidance"
        >
          <div className="space-y-4">
            <p className="text-3xl font-semibold">
              {minH}–{maxH} hours
            </p>
            <p className="text-sm text-base-content/70">
              {ageGroup
                ? `The recommended range for ${AGE_GROUPS[ageGroup] ?? ageGroup}.`
                : 'The general recommendation for adults.'}
              {!user.date_of_birth && (
                <>
                  {' '}
                  <Link href="/settings" className="link">
                    Add your birthday
                  </Link>{' '}
                  for an age-specific range.
                </>
              )}
            </p>
            <p
              className={`flex items-center gap-2 text-sm ${inRange ? 'text-success' : 'text-warning'}`}
            >
              {inRange ? (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              ) : (
                <Info className="size-4" aria-hidden="true" />
              )}
              {inRange
                ? 'Your goal is within the recommended range.'
                : 'Your goal sits outside the recommended range.'}
            </p>
            {!inRange && (
              <button
                type="button"
                className="btn btn-soft btn-primary btn-sm"
                onClick={() =>
                  setValue('target_duration_minutes', Math.round(((minH + maxH) / 2) * 4) * 15, {
                    shouldDirty: true,
                  })
                }
              >
                <Sparkles className="size-4" aria-hidden="true" /> Use{' '}
                {formatDuration(Math.round(((minH + maxH) / 2) * 4) * 15)}
              </button>
            )}
          </div>
        </SectionCard>
      </div>
    </form>
  );
}

export function GoalsView() {
  const goal = useGoal();
  return (
    <div>
      <PageHeader
        title="Goals"
        description="Set the sleep you are aiming for. Your score and streaks measure against it."
      />
      {goal.isPending ? (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      ) : goal.isError ? (
        <ErrorState className="surface" error={goal.error} onRetry={() => void goal.refetch()} />
      ) : (
        <GoalForm goal={goal.data} />
      )}
    </div>
  );
}
