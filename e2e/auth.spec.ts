import { expect, test } from '@playwright/test';
import { MAILPIT_URL, trackConsoleErrors } from './fixtures';

test.describe.configure({ mode: 'serial' });

const email = `e2e-signup+${String(Date.now())}@sleeptrack.app`;
const password = 'Moonlit-Walk-42';

test('protected pages redirect to sign in', async ({ page }) => {
  await page.goto('/journal');
  await expect(page).toHaveURL(/\/login\?next=%2Fjournal/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});

test('wrong credentials show a clear message', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('demo@sleeptrack.app');
  await page.getByLabel('Password', { exact: true }).fill('not-the-password-1');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('That email and password do not match')).toBeVisible();
});

test('register, confirm email, sign out and sign back in', async ({ page, request }) => {
  const errors = trackConsoleErrors(page);
  await page.goto('/register');
  await page.getByLabel('First name').fill('Nadia');
  await page.getByLabel('Last name').fill('Karam');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('short');
  await expect(page.getByText('Weak')).toBeVisible();
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create account' }).click();

  await page.waitForURL('**/dashboard**');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Nadia');
  await expect(page.getByText('Your first night goes here')).toBeVisible();

  const mailpit = await request
    .get(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`)
    .catch(() => null);
  if (mailpit?.ok()) {
    const { messages } = (await mailpit.json()) as { messages: { ID: string }[] };
    if (messages.length) {
      const message = (await (
        await request.get(`${MAILPIT_URL}/api/v1/message/${messages[0]!.ID}`)
      ).json()) as { Text: string; HTML: string };
      const link = /https?:\/\/[^\s"<>]+verify-email\?token=[^\s"<>]+/.exec(
        message.HTML || message.Text,
      )?.[0];
      if (link) {
        await page.goto(new URL(link).pathname + new URL(link).search);
        await expect(page.getByRole('heading', { name: 'Email confirmed' })).toBeVisible();
        await page.goto('/dashboard');
      }
    }
  }

  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForURL('**/login**');

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/dashboard**');
  expect(errors).toEqual([]);
});
