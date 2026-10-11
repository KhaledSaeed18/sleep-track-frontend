import type { ThemePreference } from '@/types/models';

export const THEME_STORAGE_KEY = 'st-theme';
export const DARK_THEME = 'midnight';
export const LIGHT_THEME = 'dawn';

export type ResolvedTheme = typeof DARK_THEME | typeof LIGHT_THEME;

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'light') return LIGHT_THEME;
  if (preference === 'dark') return DARK_THEME;
  return systemPrefersDark() ? DARK_THEME : LIGHT_THEME;
}

export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved === DARK_THEME ? 'dark' : 'light';
  return resolved;
}

/** Inline script that sets the theme before first paint to avoid a flash of the wrong theme. */
export const themeInitScript = `(function(){try{var p=localStorage.getItem('${THEME_STORAGE_KEY}');if(p!=='light'&&p!=='dark')p='system';var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.dataset.theme=d?'${DARK_THEME}':'${LIGHT_THEME}';r.style.colorScheme=d?'dark':'light';}catch(e){document.documentElement.dataset.theme='${DARK_THEME}';}})();`;
