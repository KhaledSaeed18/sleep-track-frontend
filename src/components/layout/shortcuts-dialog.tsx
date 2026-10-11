'use client';

import { Kbd } from '@/components/ui/kbd';
import { Modal } from '@/components/ui/modal';
import { NAV_ITEMS } from '@/config/nav';
import { useUiStore } from '@/stores/ui-store';

const GENERAL = [
  { keys: ['⌘', 'K'], label: 'Open the command menu' },
  { keys: ['N'], label: 'Log a night' },
  { keys: ['?'], label: 'Show keyboard shortcuts' },
  { keys: ['Esc'], label: 'Close a dialog or menu' },
];

export function ShortcutsDialog() {
  const open = useUiStore((state) => state.shortcutsOpen);
  const setOpen = useUiStore((state) => state.setShortcutsOpen);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Keyboard shortcuts"
      description="Move around without reaching for the mouse."
      size="lg"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h3 className="mb-2 text-sm font-medium text-base-content/60">General</h3>
          <ul className="divide-y divide-(--hairline)">
            {GENERAL.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-4 py-2 text-sm">
                {item.label}
                <Kbd keys={item.keys} />
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-2 text-sm font-medium text-base-content/60">Navigation</h3>
          <ul className="divide-y divide-(--hairline)">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="flex items-center justify-between gap-4 py-2 text-sm">
                {item.label}
                <Kbd keys={['G', item.chord.toUpperCase()]} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  );
}
