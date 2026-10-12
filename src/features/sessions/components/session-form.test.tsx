import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@/test/next-navigation';
import { ApiError } from '@/lib/api/errors';
import { tokenStore } from '@/lib/auth/token-store';
import { db } from '@/mocks/handlers';
import { renderWithClient } from '@/test/utils';
import type { SessionFormValues } from '../schemas/session-form';
import { SessionForm } from './session-form';

const defaults: SessionFormValues = {
  started_at: '2026-10-10T23:00',
  ended_at: '2026-10-11T07:00',
  quality: null,
  mood_on_wake: null,
  sleep_latency_minutes: null,
  awakenings: null,
  notes: '',
  tag_ids: [],
};

function renderForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  const result = renderWithClient(
    <>
      <SessionForm
        id="f"
        zone="UTC"
        timeFormat="24h"
        defaultValues={defaults}
        onSubmit={onSubmit}
      />
      <button type="submit" form="f">
        Save
      </button>
    </>,
  );
  return { ...result, onSubmit };
}

describe('SessionForm', () => {
  it('previews the duration as times change', () => {
    renderForm();
    expect(screen.getByText('8h')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Woke up'), { target: { value: '2026-10-11T06:30' } });
    expect(screen.getByText('7h 30m')).toBeInTheDocument();
  });

  it('blocks a wake time before bedtime', async () => {
    const { user, onSubmit } = renderForm();
    fireEvent.change(screen.getByLabelText('Woke up'), { target: { value: '2026-10-10T22:00' } });
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Wake time must be after bedtime')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits ratings, tags and awakenings', async () => {
    db.currentUserId = db.users[0]!.id;
    tokenStore.set('token', 900);
    const { user, onSubmit } = renderForm();
    await user.click(screen.getByRole('radio', { name: '4, Good' }));
    await user.click(screen.getByRole('button', { name: 'Increase awakenings' }));
    await user.click(await screen.findByRole('button', { name: 'Caffeine' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const values = onSubmit.mock.calls[0]![0] as SessionFormValues;
    expect(values.quality).toBe(4);
    expect(values.awakenings).toBe(1);
    expect(values.tag_ids).toHaveLength(1);
  });

  it('shows server conflicts at form level', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError({ status: 409, code: 'session_overlap', title: 'Overlap' }));
    const { user } = renderForm(onSubmit);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('overlaps another night');
  });
});
