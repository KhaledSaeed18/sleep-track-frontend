import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHotkeys, type HotkeyMap } from './use-hotkeys';

function Harness({ map }: { map: HotkeyMap }) {
  useHotkeys(map);
  return <input aria-label="field" />;
}

describe('useHotkeys', () => {
  it('handles single keys, chords and modifier combos', () => {
    const map = { n: vi.fn(), 'g d': vi.fn(), 'mod+k': vi.fn() };
    render(<Harness map={map} />);
    fireEvent.keyDown(window, { key: 'n' });
    fireEvent.keyDown(window, { key: 'g' });
    fireEvent.keyDown(window, { key: 'd' });
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(map.n).toHaveBeenCalledTimes(1);
    expect(map['g d']).toHaveBeenCalledTimes(1);
    expect(map['mod+k']).toHaveBeenCalledTimes(1);
  });

  it('ignores plain keys while typing', () => {
    const map = { n: vi.fn(), 'mod+k': vi.fn() };
    const { getByLabelText } = render(<Harness map={map} />);
    const field = getByLabelText('field');
    fireEvent.keyDown(field, { key: 'n' });
    fireEvent.keyDown(field, { key: 'k', ctrlKey: true });
    expect(map.n).not.toHaveBeenCalled();
    expect(map['mod+k']).toHaveBeenCalledTimes(1);
  });
});
