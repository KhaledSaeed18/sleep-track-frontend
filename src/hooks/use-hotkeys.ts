'use client';

import { useEffect, useRef } from 'react';

export type HotkeyHandler = (event: KeyboardEvent) => void;

export interface HotkeyMap {
  /** Keys like `mod+k`, `?`, `n`, or chords like `g d`. */
  [combo: string]: HotkeyHandler;
}

const CHORD_TIMEOUT = 900;

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function normalise(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.metaKey || event.ctrlKey) parts.push('mod');
  if (event.altKey) parts.push('alt');
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key.toLowerCase();
  parts.push(key === ' ' ? 'space' : key);
  return parts.join('+');
}

/**
 * Global keyboard shortcuts. Single keys and chords are ignored while typing in a field or when a
 * modal dialog is open; `mod+` combinations always fire.
 */
export function useHotkeys(map: HotkeyMap, enabled = true): void {
  const mapRef = useRef(map);
  const pendingChord = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    mapRef.current = map;
  });

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return;
      const combo = normalise(event);
      const handlers = mapRef.current;

      if (combo.startsWith('mod+')) {
        const handler = handlers[combo];
        if (handler) {
          event.preventDefault();
          handler(event);
        }
        return;
      }

      if (isEditable(event.target) || document.querySelector('dialog[open]')) return;

      const pending = pendingChord.current;
      if (pending && Date.now() - pending.at < CHORD_TIMEOUT) {
        const chordHandler = handlers[`${pending.key} ${combo}`];
        pendingChord.current = null;
        if (chordHandler) {
          event.preventDefault();
          chordHandler(event);
          return;
        }
      }

      if (Object.keys(handlers).some((key) => key.startsWith(`${combo} `))) {
        pendingChord.current = { key: combo, at: Date.now() };
        return;
      }

      const key = event.key === '?' ? '?' : combo;
      const handler = handlers[key];
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
