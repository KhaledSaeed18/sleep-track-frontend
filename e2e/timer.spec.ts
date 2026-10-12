import { expect, test, type Page } from '@playwright/test';
import { signedInPage, testUser } from './fixtures';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await signedInPage(browser, testUser());
});

test.afterAll(async () => {
  await page.context().close();
});

test('start, discard and restart the sleep timer', async () => {
  const timer = page.locator('#timer');
  await timer.getByRole('button', { name: 'Going to sleep' }).click();
  await expect(timer.getByText('Running', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Sleep timer running/ })).toBeVisible();

  await timer.getByRole('button', { name: 'Discard timer' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Discard timer' }).click();
  await expect(timer.getByRole('button', { name: 'Going to sleep' })).toBeVisible();
});

test('a backdated timer can be stopped with a morning check-in', async () => {
  const timer = page.locator('#timer');
  await timer.getByRole('button', { name: 'Set an earlier start time' }).click();
  const start = new Date(Date.now() - 7 * 3_600_000);
  const value = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Beirut',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(start)
    .replace(' ', 'T');
  await timer.getByLabel('When did you go to bed?').fill(value);
  await timer.getByRole('button', { name: 'Start from this time' }).click();
  await expect(timer.getByText('Running', { exact: true })).toBeVisible();

  await timer.getByRole('button', { name: 'I am awake' }).click();
  const dialog = page.getByRole('dialog', { name: 'Good morning' });
  await dialog.getByRole('radio', { name: '5, Excellent' }).click();
  await dialog.getByRole('button', { name: 'Log this night' }).click();
  await expect(page.getByText('Good morning. Your night is logged.')).toBeVisible();
  await expect(timer.getByRole('button', { name: 'Going to sleep' })).toBeVisible();
});
