'use client';

import { Command } from 'cmdk';
import { Download, Keyboard, Laptop, LogOut, Moon, Play, Plus, Square, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Modal } from '@/components/ui/modal';
import { NAV_ITEMS } from '@/config/nav';
import { useThemePreference } from '@/features/account/hooks/use-theme-preference';
import { useLogout, useUser } from '@/features/auth';
import { useStartTimer, useTimer } from '@/features/timer/hooks';
import { useUiStore } from '@/stores/ui-store';

function Item({
  children,
  onSelect,
  keywords,
  shortcut,
}: {
  children: ReactNode;
  onSelect: () => void;
  keywords?: string[];
  shortcut?: string[];
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      keywords={keywords}
      className="flex cursor-pointer items-center gap-3 rounded-field px-3 py-2.5 text-sm outline-none data-[selected=true]:bg-primary/12 [&_svg]:size-4 [&_svg]:opacity-75"
    >
      {children}
      {shortcut && (
        <span className="ml-auto flex gap-1" aria-hidden="true">
          {shortcut.map((key) => (
            <kbd key={key} className="kbd kbd-xs">
              {key}
            </kbd>
          ))}
        </span>
      )}
    </Command.Item>
  );
}

const groupClass =
  '[&_[cmdk-group-heading]]:text-base-content/50 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium';

export function CommandPalette() {
  const open = useUiStore((state) => state.commandPaletteOpen);
  const setOpen = useUiStore((state) => state.setCommandPaletteOpen);
  const openEditor = useUiStore((state) => state.openSessionEditor);
  const setShortcutsOpen = useUiStore((state) => state.setShortcutsOpen);
  const router = useRouter();
  const user = useUser();
  const logout = useLogout();
  const [, setTheme] = useThemePreference();
  const { data: timer } = useTimer();
  const startTimer = useStartTimer();

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Command menu"
      size="md"
      className="[&>header]:sr-only"
    >
      <Command label="Command menu" className="-mx-3 pt-4" loop>
        <div className="mx-3 border-b border-(--hairline) pb-3">
          <Command.Input
            autoFocus
            placeholder="Type a command or search…"
            className="input w-full input-ghost text-base focus:outline-none"
          />
        </div>
        <Command.List className="max-h-[min(60vh,26rem)] scrollbar-thin overflow-y-auto px-1.5 pt-1">
          <Command.Empty className="py-10 text-center text-sm text-base-content/60">
            No results. Try another word.
          </Command.Empty>

          <Command.Group heading="Actions" className={groupClass}>
            <Item
              onSelect={() => run(() => openEditor({ mode: 'create' }))}
              keywords={['add', 'new', 'session', 'sleep']}
              shortcut={['N']}
            >
              <Plus /> Log a night
            </Item>
            {timer?.active ? (
              <Item
                onSelect={() => run(() => router.push('/dashboard#timer'))}
                keywords={['wake', 'stop', 'timer']}
              >
                <Square /> Stop sleep timer
              </Item>
            ) : (
              <Item
                onSelect={() => run(() => startTimer.mutate({}))}
                keywords={['sleep', 'bed', 'timer', 'start']}
              >
                <Play /> Start sleep timer
              </Item>
            )}
            <Item
              onSelect={() => run(() => router.push('/settings/data'))}
              keywords={['csv', 'json', 'download', 'backup']}
            >
              <Download /> Export your data
            </Item>
          </Command.Group>

          <Command.Group heading="Go to" className={groupClass}>
            {NAV_ITEMS.filter((item) => !item.adminOnly || user.role === 'admin').map((item) => (
              <Item
                key={item.href}
                onSelect={() => run(() => router.push(item.href))}
                shortcut={['G', item.chord.toUpperCase()]}
              >
                <item.icon /> {item.label}
              </Item>
            ))}
          </Command.Group>

          <Command.Group heading="Appearance" className={groupClass}>
            <Item
              onSelect={() => run(() => setTheme('dark'))}
              keywords={['theme', 'night', 'midnight']}
            >
              <Moon /> Dark theme
            </Item>
            <Item onSelect={() => run(() => setTheme('light'))} keywords={['theme', 'day', 'dawn']}>
              <Sun /> Light theme
            </Item>
            <Item onSelect={() => run(() => setTheme('system'))} keywords={['theme', 'auto']}>
              <Laptop /> Match system theme
            </Item>
          </Command.Group>

          <Command.Group heading="Help" className={groupClass}>
            <Item
              onSelect={() => run(() => setShortcutsOpen(true))}
              keywords={['keys', 'hotkeys']}
              shortcut={['?']}
            >
              <Keyboard /> Keyboard shortcuts
            </Item>
            <Item onSelect={() => run(() => logout.mutate())} keywords={['logout', 'exit']}>
              <LogOut /> Sign out
            </Item>
          </Command.Group>
        </Command.List>
      </Command>
    </Modal>
  );
}
