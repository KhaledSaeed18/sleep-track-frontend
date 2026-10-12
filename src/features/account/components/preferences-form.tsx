'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Laptop, Moon, Sun } from 'lucide-react';
import { useId, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { FormAlert } from '@/components/ui/form-alert';
import { SectionCard } from '@/components/ui/page-header';
import { Segmented } from '@/components/ui/segmented';
import { useUser } from '@/features/auth';
import { browserTimezone, formatInZone, supportedTimezones } from '@/lib/date';
import { applyServerErrors } from '@/lib/forms';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';
import { useUpdatePreferences } from '../hooks';
import { preferencesSchema, type PreferencesValues } from '../schemas';

const THEMES = [
  { value: 'system', label: 'System', icon: Laptop },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-6 py-3">
      <span>
        <span className="block font-medium">{label}</span>
        <span className="block text-sm text-base-content/60">{description}</span>
      </span>
      <input
        id={id}
        type="checkbox"
        className="toggle mt-1 toggle-primary"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export function PreferencesForm() {
  const user = useUser();
  const update = useUpdatePreferences({ silent: true });
  const setTheme = useUiStore((state) => state.setTheme);
  const zones = useMemo(() => supportedTimezones(), []);
  const listId = useId();
  const detected = browserTimezone();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: user.preferences,
  });
  const [zone, timeFormat] = useWatch({ control, name: ['timezone', 'time_format'] });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = await update.mutateAsync(values);
      setTheme(saved.theme);
      reset(saved);
    } catch (error) {
      const message = applyServerErrors(error, setError, [
        'timezone',
        'time_format',
        'week_starts_on',
        'theme',
      ]);
      if (message) setError('root.server', { message });
    }
  });

  let preview = '';
  try {
    preview = formatInZone(new Date(), zone, timeFormat === '12h' ? 'EEE h:mm a' : 'EEE HH:mm');
  } catch {
    preview = '';
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {errors.root?.server && <FormAlert tone="error">{errors.root.server.message}</FormAlert>}
      {update.isSuccess && !isDirty && <FormAlert tone="success">Preferences saved.</FormAlert>}

      <SectionCard
        title="Time and dates"
        description="All times across SleepTrack use these settings."
      >
        <div className="space-y-5">
          <div>
            <label htmlFor="pref-timezone" className="field-label">
              Time zone
            </label>
            <div className="join w-full">
              <input
                id="pref-timezone"
                list={listId}
                className={cn('input join-item w-full', errors.timezone && 'input-error')}
                autoComplete="off"
                {...register('timezone')}
              />
              {zone !== detected && (
                <button
                  type="button"
                  className="btn join-item"
                  onClick={() =>
                    setValue('timezone', detected, { shouldDirty: true, shouldValidate: true })
                  }
                >
                  Use {detected.replace(/_/g, ' ')}
                </button>
              )}
            </div>
            <datalist id={listId}>
              {zones.map((z) => (
                <option key={z} value={z} />
              ))}
            </datalist>
            {errors.timezone ? (
              <p className="field-error">{errors.timezone.message}</p>
            ) : (
              preview && <p className="field-hint">It is {preview} there now.</p>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <span className="field-label">Clock</span>
              <Controller
                control={control}
                name="time_format"
                render={({ field }) => (
                  <Segmented
                    label="Clock format"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: '24h', label: '24-hour' },
                      { value: '12h', label: '12-hour' },
                    ]}
                    size="md"
                  />
                )}
              />
            </div>
            <div>
              <span className="field-label">Week starts on</span>
              <Controller
                control={control}
                name="week_starts_on"
                render={({ field }) => (
                  <Segmented
                    label="Week starts on"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: 'monday', label: 'Monday' },
                      { value: 'sunday', label: 'Sunday' },
                    ]}
                    size="md"
                  />
                )}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Appearance">
        <Controller
          control={control}
          name="theme"
          render={({ field }) => (
            <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  role="radio"
                  aria-checked={field.value === theme.value}
                  onClick={() => field.onChange(theme.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-box border border-(--hairline) p-4 text-sm font-medium transition-colors',
                    field.value === theme.value
                      ? 'border-primary bg-primary/8 text-base-content'
                      : 'text-base-content/70 hover:bg-base-200',
                  )}
                >
                  <theme.icon className="size-5" aria-hidden="true" />
                  {theme.label}
                </button>
              ))}
            </div>
          )}
        />
      </SectionCard>

      <SectionCard
        title="Email"
        description={user.is_demo ? 'Demo accounts do not receive email.' : undefined}
      >
        <div className="divide-y divide-(--hairline)">
          <Controller
            control={control}
            name="email_weekly_report"
            render={({ field }) => (
              <ToggleRow
                id="pref-weekly"
                label="Weekly report"
                description="A summary of last week, every Monday morning."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="email_bedtime_reminder"
            render={({ field }) => (
              <ToggleRow
                id="pref-reminder"
                label="Bedtime reminder"
                description="A nudge 30 minutes before your goal bedtime."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </SectionCard>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => reset()}
          disabled={!isDirty || isSubmitting}
        >
          Discard
        </button>
        <button type="submit" className="btn btn-primary" disabled={!isDirty || isSubmitting}>
          {isSubmitting && (
            <span className="loading loading-sm loading-spinner" aria-hidden="true" />
          )}
          Save preferences
        </button>
      </div>
    </form>
  );
}
