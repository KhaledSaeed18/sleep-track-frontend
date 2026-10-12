import { expect, test } from '@playwright/test';
import { trackConsoleErrors } from './fixtures';

test('explore the live demo across the app', async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'See what your nights are telling you.',
  );
  await page.getByRole('button', { name: 'Try the live demo' }).first().click();
  await page.waitForURL('**/dashboard**', { timeout: 30_000 });
  await expect(
    page
      .getByRole('heading', { name: 'Last night' })
      .or(page.getByRole('heading', { name: 'Most recent night' })),
  ).toBeVisible();

  await page.keyboard.press('ControlOrMeta+k');
  const palette = page.getByRole('dialog', { name: 'Command menu' });
  await palette.getByPlaceholder('Type a command or search…').fill('analytics');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/analytics');
  await expect(page.getByRole('heading', { name: 'Nightly trend' })).toBeVisible();
  await page.getByRole('radio', { name: '90 days' }).click();
  await expect(page).toHaveURL(/range=90d/);
  await expect(page.getByRole('img', { name: /Calendar of nightly sleep scores/ })).toBeVisible();

  await page.getByRole('button', { name: 'Show as table' }).first().click();
  await expect(page.getByRole('columnheader', { name: 'Night' }).first()).toBeVisible();

  await page.goto('/insights');
  await expect(page.getByRole('heading', { name: 'Insights' })).toBeVisible();
  await page.goto('/reports');
  await expect(page.getByRole('heading', { name: 'Night by night' })).toBeVisible();

  await page.keyboard.press('Shift+?');
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible();
  expect(errors).toEqual([]);
});
