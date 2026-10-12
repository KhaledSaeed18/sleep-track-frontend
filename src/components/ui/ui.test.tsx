import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './confirm-dialog';
import { Pagination } from './pagination';
import { Rating } from './rating';
import { Segmented } from './segmented';

describe('Rating', () => {
  it('is a labelled radio group that reports changes', async () => {
    const onChange = vi.fn();
    render(
      <Rating label="Sleep quality" value={null} onChange={onChange} valueLabels={{ 4: 'Good' }} />,
    );
    expect(screen.getByRole('radiogroup', { name: 'Sleep quality' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: '4, Good' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('renders a read-only summary', () => {
    render(<Rating label="Quality" value={3} />);
    expect(screen.getByRole('img', { name: 'Quality: 3 of 5' })).toBeInTheDocument();
  });
});

describe('Pagination', () => {
  it('shows the range and moves between pages', async () => {
    const onChange = vi.fn();
    render(<Pagination page={2} pages={6} total={113} pageSize={20} onChange={onChange} />);
    expect(screen.getByText('Showing 21–40 of 113')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('collapses long page lists', () => {
    render(<Pagination page={10} pages={20} total={400} pageSize={20} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 20' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Page 5' })).not.toBeInTheDocument();
  });
});

describe('Segmented', () => {
  it('exposes radio semantics', async () => {
    function Harness() {
      const [value, setValue] = useState<'a' | 'b'>('a');
      return (
        <Segmented
          label="Metric"
          value={value}
          onChange={setValue}
          options={[
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' },
          ]}
        />
      );
    }
    render(<Harness />);
    await userEvent.click(screen.getByRole('radio', { name: 'Beta' }));
    expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('aria-checked', 'true');
  });
});

describe('ConfirmDialog', () => {
  it('confirms and cancels', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Delete this night?"
        confirmLabel="Delete night"
        tone="error"
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Delete night' }));
    expect(onConfirm).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('locks while pending', () => {
    render(
      <ConfirmDialog
        open
        pending
        title="Delete?"
        confirmLabel="Delete"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
