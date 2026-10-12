import { expect, test } from '@playwright/test';
import { trackConsoleErrors } from './fixtures';

// Server markup always assumes the system theme; a stored choice must not cause a hydration mismatch.
// Production builds do not log mismatches, so the aria-pressed check is what guards CI.
for (const stored of ['light', 'dark'] as const) {
  test(`a stored ${stored} theme hydrates cleanly`, async ({ page }) => {
    await page.addInitScript((value) => window.localStorage.setItem('st-theme', value), stored);
    const errors = trackConsoleErrors(page);

    for (const path of ['/login', '/']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }

    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      stored === 'dark' ? 'midnight' : 'dawn',
    );
    await page.getByRole('button', { name: /^Theme:/ }).click();
    await expect(
      page.getByRole('button', { name: stored === 'dark' ? 'Dark' : 'Light', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(errors).toEqual([]);
  });
}
