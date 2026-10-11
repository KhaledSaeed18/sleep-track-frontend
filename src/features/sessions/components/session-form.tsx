'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Minus, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { NightArc } from '@/components/brand/night-arc';
import { TextAreaField, TextField } from '@/components/ui/field';
import { Rating } from '@/components/ui/rating';
import { TagPicker } from '@/features/tags/components/tag-picker';
import { formatClock } from '@/lib/date';
import { MOOD_LABELS, QUALITY_LABELS, formatDuration } from '@/lib/format';
import { applyServerErrors } from '@/lib/forms';
import type { TimeFormat } from '@/types/models';
import { previewDuration } from '../lib/defaults';
import {
  createSessionFormSchema,
  SESSION_FORM_FIELDS,
  type SessionFormValues,
} from '../schemas/session-form';

interface SessionFormProps {
  id: string;
  zone: string;
  timeFormat: TimeFormat;
  defaultValues: SessionFormValues;
  onSubmit: (values: SessionFormValues) => Promise<unknown>;
  /** Hide the bedtime field, for stopping a running timer. */
  hideStart?: boolean;
}

function NightPreview({
  start,
  end,
  zone,
  timeFormat,
}: {
  start: string;
  end: string;
  zone: string;
  timeFormat: TimeFormat;
}) {
  const minutes = previewDuration(start, end, zone);
  const valid = minutes !== null && minutes > 0;
  const startClock = start.slice(11, 16);
  const endClock = end.slice(11, 16);
  return (
    <div className="sky-gradient relative overflow-hidden rounded-box border border-(--hairline) px-6 pt-5 pb-3">
      <NightArc
        progress={valid ? 1 : null}
        fill={valid ? Math.min(1, minutes / 600) : 0}
        startLabel={startClock ? `In bed ${formatClock(startClock, timeFormat)}` : ''}
        endLabel={endClock ? `Up ${formatClock(endClock, timeFormat)}` : ''}
        className="mx-auto max-w-xs"
      >
        <span className="tabular font-display text-3xl font-semibold" aria-live="polite">
          {valid ? formatDuration(minutes) : '—'}
        </span>
        <span className="text-xs text-base-content/60">time asleep</span>
      </NightArc>
    </div>
  );
}

function Stepper({
  value,
  onChange,
  min = 0,
  max = 50,
  label,
  id,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  label: string;
  id: string;
}) {
  const current = value ?? 0;
  return (
    <div className="join" role="group" aria-label={label}>
      <button
        type="button"
        className="btn join-item btn-square"
        onClick={() => onChange(Math.max(min, current - 1))}
        disabled={current <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        className="tabular input join-item w-16 text-center"
        value={value ?? ''}
        placeholder="—"
        min={min}
        max={max}
        onChange={(event) =>
          onChange(event.target.value === '' ? null : Number(event.target.value))
        }
      />
      <button
        type="button"
        className="btn join-item btn-square"
        onClick={() => onChange(Math.min(max, current + 1))}
        disabled={current >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function SessionForm({
  id,
  zone,
  timeFormat,
  defaultValues,
  onSubmit,
  hideStart = false,
}: SessionFormProps) {
  const schema = useMemo(() => createSessionFormSchema(zone), [zone]);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  });

  const [startedAt, endedAt, notes] = useWatch({
    control,
    name: ['started_at', 'ended_at', 'notes'],
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      const message = applyServerErrors(error, setError, SESSION_FORM_FIELDS);
      if (message) setError('root.server', { type: 'server', message });
    }
  });

  return (
    <form id={id} onSubmit={submit} noValidate className="space-y-6">
      {errors.root?.server && (
        <div role="alert" className="alert alert-soft alert-error">
          <AlertCircle className="size-4" aria-hidden="true" />
          <span>{errors.root.server.message}</span>
        </div>
      )}

      <NightPreview start={startedAt} end={endedAt} zone={zone} timeFormat={timeFormat} />

      <div className="grid gap-4 sm:grid-cols-2">
        {!hideStart && (
          <TextField
            label="Went to bed"
            type="datetime-local"
            error={errors.started_at?.message}
            {...register('started_at')}
          />
        )}
        <TextField
          label="Woke up"
          type="datetime-local"
          error={errors.ended_at?.message}
          containerClassName={hideStart ? 'sm:col-span-2' : undefined}
          {...register('ended_at')}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <span className="field-label" id={`${id}-quality`}>
            Sleep quality
          </span>
          <Controller
            control={control}
            name="quality"
            render={({ field }) => (
              <Rating
                label="Sleep quality"
                value={field.value}
                onChange={field.onChange}
                valueLabels={QUALITY_LABELS}
                showValueLabel
              />
            )}
          />
        </div>
        <div>
          <span className="field-label" id={`${id}-mood`}>
            Mood on waking
          </span>
          <Controller
            control={control}
            name="mood_on_wake"
            render={({ field }) => (
              <Rating
                label="Mood on waking"
                value={field.value}
                onChange={field.onChange}
                valueLabels={MOOD_LABELS}
                shape="circle"
                showValueLabel
              />
            )}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Controller
          control={control}
          name="sleep_latency_minutes"
          render={({ field }) => (
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor={`${id}-latency`} className="field-label">
                  Time to fall asleep
                </label>
                <span className="tabular text-sm text-base-content/70">
                  {field.value === null ? 'Not set' : `${String(field.value)} min`}
                </span>
              </div>
              <input
                id={`${id}-latency`}
                type="range"
                min={0}
                max={120}
                step={5}
                value={field.value ?? 0}
                onChange={(event) => field.onChange(Number(event.target.value))}
                className="range w-full range-primary range-sm"
                aria-valuetext={field.value === null ? 'Not set' : `${String(field.value)} minutes`}
              />
              <div
                className="tabular mt-1 flex justify-between text-xs text-base-content/45"
                aria-hidden="true"
              >
                <span>0</span>
                <span>30</span>
                <span>60</span>
                <span>90</span>
                <span>120</span>
              </div>
              {errors.sleep_latency_minutes && (
                <p className="field-error">{errors.sleep_latency_minutes.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          control={control}
          name="awakenings"
          render={({ field }) => (
            <div>
              <label htmlFor={`${id}-awakenings`} className="field-label">
                Times you woke up
              </label>
              <Stepper
                id={`${id}-awakenings`}
                label="Awakenings"
                value={field.value}
                onChange={field.onChange}
              />
              {errors.awakenings && <p className="field-error">{errors.awakenings.message}</p>}
            </div>
          )}
        />
      </div>

      <Controller
        control={control}
        name="tag_ids"
        render={({ field }) => <TagPicker value={field.value} onChange={field.onChange} />}
      />

      <TextAreaField
        label="Notes"
        rows={3}
        placeholder="Anything worth remembering about this night?"
        hint={`${String(notes.length)} / 2000`}
        error={errors.notes?.message}
        {...register('notes')}
      />
    </form>
  );
}
