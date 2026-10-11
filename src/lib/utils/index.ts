export { cn } from './cn';
export { readCookie, deleteCookie } from './cookies';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isSafeRedirect(path: string | null | undefined): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\');
}

export function initials(first?: string | null, last?: string | null, fallback = '?'): string {
  const value = `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
  return value || fallback;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
