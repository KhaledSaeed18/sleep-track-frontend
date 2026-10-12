import { readFileSync } from 'node:fs';
import { expect, type Browser, type Page } from '@playwright/test';

export const USER_FILE = 'e2e/.auth/user.json';

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export function testUser(): TestUser {
  return JSON.parse(readFileSync(USER_FILE, 'utf8')) as TestUser;
}

export const SEEDED_DEMO = { email: 'demo@sleeptrack.app', password: 'DemoPass123' };

/** Opens a page and signs in through the UI. Specs share it to stay under the login rate limit. */
export async function signedInPage(
  browser: Browser,
  credentials: { email: string; password: string },
): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/login');
  await page.getByLabel('Email').fill(credentials.email);
  await page.getByLabel('Password', { exact: true }).fill(credentials.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/dashboard**');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  return page;
}

/** Collects console errors so specs can assert a clean run. */
export function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

export const MAILPIT_URL = process.env.MAILPIT_URL ?? 'http://localhost:8025';
