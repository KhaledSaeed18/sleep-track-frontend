// Server-side stand-in for `msw/browser`, which is only meaningful in the browser.
export function setupWorker(): never {
  throw new Error('msw/browser is only available in the browser');
}
