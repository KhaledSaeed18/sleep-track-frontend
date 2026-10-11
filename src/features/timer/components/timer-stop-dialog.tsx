'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { TextAreaField } from '@/components/ui/field';
import { Rating } from '@/components/ui/rating';
import { FormAlert } from '@/components/ui/form-alert';
import { TagPicker } from '@/features/tags/components/tag-picker';
import { errorMessage } from '@/lib/api/errors';
import { MOOD_LABELS, QUALITY_LABELS, formatDuration } from '@/lib/format';
import { useStopTimer } from '../hooks';

interface TimerStopDialogProps {
  open: boolean;
  onClose: () => void;
  elapsedMinutes: number;
}

/** Morning check-in shown when stopping a running timer. */
export function TimerStopDialog({ open, onClose, elapsedMinutes }: TimerStopDialogProps) {
  const stop = useStopTimer();
  const [quality, setQuality] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const tooShort = elapsedMinutes < 10;

  function submit() {
    stop.mutate(
      { quality, mood_on_wake: mood, tag_ids: tags, notes: notes.trim() || null },
      {
        onSuccess: () => {
          setQuality(null);
          setMood(null);
          setTags([]);
          setNotes('');
          onClose();
        },
      },
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!stop.isPending}
      title="Good morning"
      description={`You slept for about ${formatDuration(elapsedMinutes)}. How was it?`}
      footer={
        <>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={stop.isPending}
          >
            Keep sleeping
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={submit}
            disabled={stop.isPending || tooShort}
          >
            {stop.isPending && (
              <span className="loading loading-sm loading-spinner" aria-hidden="true" />
            )}
            Log this night
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {tooShort && (
          <FormAlert tone="info">
            A night must last at least 10 minutes. Discard the timer if you started it by mistake.
          </FormAlert>
        )}
        {stop.isError && <FormAlert tone="error">{errorMessage(stop.error)}</FormAlert>}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className="field-label">Sleep quality</span>
            <Rating
              label="Sleep quality"
              value={quality}
              onChange={setQuality}
              valueLabels={QUALITY_LABELS}
              showValueLabel
            />
          </div>
          <div>
            <span className="field-label">Mood on waking</span>
            <Rating
              label="Mood on waking"
              value={mood}
              onChange={setMood}
              valueLabels={MOOD_LABELS}
              shape="circle"
              showValueLabel
            />
          </div>
        </div>
        <TagPicker value={tags} onChange={setTags} />
        <TextAreaField
          label="Notes"
          rows={2}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={2000}
          placeholder="Dreams, disturbances, anything notable"
        />
      </div>
    </Modal>
  );
}
