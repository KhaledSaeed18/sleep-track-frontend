import { expect, test, type Page } from '@playwright/test';
import { localDateTime } from './dates';
import { signedInPage, testUser, trackConsoleErrors } from './fixtures';

test.describe.configure({ mode: 'serial' });

let page: Page;
let errors: string[];

test.beforeAll(async ({ browser }) => {
  page = await signedInPage(browser, testUser());
  errors = trackConsoleErrors(page);
});

test.afterAll(async () => {
  await page.context().close();
});

async function logNight(
  daysAgo: number,
  bed: string,
  wake: string,
  options: { quality?: string; tag?: string } = {},
) {
  await page.getByRole('button', { name: 'Log a night' }).first().click();
  const sheet = page.getByRole('dialog', { name: 'Log a night' });
  await expect(sheet).toBeVisible();
  await sheet.getByLabel('Went to bed', { exact: true }).fill(localDateTime(daysAgo + 1, bed));
  await sheet.getByLabel('Woke up', { exact: true }).fill(localDateTime(daysAgo, wake));
  if (options.quality) await sheet.getByRole('radio', { name: options.quality }).click();
  if (options.tag) await sheet.getByRole('button', { name: options.tag, exact: true }).click();
  await sheet.getByRole('button', { name: 'Save night' }).click();
}

test('log a night from the journal', async () => {
  await page.goto('/journal');
  await expect(page.getByText('Your journal is empty')).toBeVisible();
  await logNight(3, '23:10', '07:05', { quality: '4, Good', tag: 'Reading' });
  await expect(page.getByText('Night logged')).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: '7h 55m' })).toBeVisible();
});

test('overlapping nights are rejected with a clear message', async () => {
  await logNight(3, '23:30', '06:00');
  const sheet = page.getByRole('dialog', { name: 'Log a night' });
  await expect(sheet.getByRole('alert')).toContainText(/overlaps/i);
  await sheet.getByRole('button', { name: 'Cancel' }).click();
  // The browser logs the expected 409; anything else is still a failure.
  errors.splice(0, errors.length, ...errors.filter((e) => !e.includes('409 (Conflict)')));
});

test('edit a night and see it on the detail page', async () => {
  await page
    .getByRole('button', { name: /Actions for/ })
    .first()
    .click();
  await page.getByRole('button', { name: 'Edit' }).click();
  const sheet = page.getByRole('dialog', { name: 'Edit night' });
  await sheet.getByLabel('Notes').fill('Slept with the window open.');
  await sheet.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Changes saved')).toBeVisible();

  await page.getByRole('row').filter({ hasText: '7h 55m' }).getByRole('link').first().click();
  await expect(page.getByRole('heading', { name: /Night of/ })).toBeVisible();
  await expect(page.getByText('Slept with the window open.')).toBeVisible();
});

test('filter, select and bulk delete', async () => {
  await page.goto('/journal');
  await logNight(5, '22:45', '06:15');
  await expect(page.getByText('Night logged')).toBeVisible();
  await page.getByRole('combobox', { name: 'Filter by quality' }).selectOption('great');
  await expect(page.getByRole('row')).toHaveCount(2);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('row')).toHaveCount(3);

  await page.getByRole('checkbox', { name: 'Select all nights on this page' }).check();
  await expect(page.getByText('2 nights selected')).toBeVisible();
  await page
    .getByRole('region', { name: 'Bulk actions' })
    .getByRole('button', { name: 'Delete' })
    .click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete 2 nights' }).click();
  await expect(page.getByText('Your journal is empty')).toBeVisible();
  expect(errors).toEqual([]);
});
