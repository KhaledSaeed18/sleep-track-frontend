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

test('update the profile name', async () => {
  await page.goto('/settings');
  await page.getByLabel('First name').fill('Eleanor');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Profile saved')).toBeVisible();
});

test('switch to a 12-hour clock', async () => {
  await page.goto('/settings/preferences');
  await page.getByRole('radio', { name: '12-hour' }).click();
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await expect(page.getByText('Preferences saved.')).toBeVisible();
  await page.goto('/goals');
  await expect(page.getByText(/Bed \d{1,2}:\d{2} (AM|PM)/)).toBeVisible();
});

test('create and delete a tag', async () => {
  await page.goto('/tags');
  await page.getByRole('button', { name: 'New tag' }).click();
  const dialog = page.getByRole('dialog', { name: 'New tag' });
  await dialog.getByLabel('Name').fill('Late workout');
  await dialog.getByRole('button', { name: 'dumbbell' }).click();
  await dialog.getByRole('button', { name: 'Create tag' }).click();
  await expect(page.getByText('Tag created')).toBeVisible();
  await page.getByRole('button', { name: 'Delete Late workout' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete tag' }).click();
  await expect(page.getByText('Late workout')).toHaveCount(0);
});

test('adjust the sleep goal', async () => {
  await page.goto('/goals');
  const slider = page.getByLabel('Sleep each night');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await page.getByRole('button', { name: 'Save goals' }).click();
  await expect(page.getByText('Goals saved')).toBeVisible();
});

test('sessions and activity are listed under security', async () => {
  await page.goto('/settings/security');
  await expect(page.getByText('This device')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Signed in' }).first()).toBeVisible();
});
