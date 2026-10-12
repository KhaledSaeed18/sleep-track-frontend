// Captures the README screenshots from a running app signed in as the seeded demo account.
//
//   pnpm screenshots                       # against http://localhost:3000
//   BASE_URL=https://example.com pnpm screenshots
//
// Every visited page is also checked for console errors, so the script doubles as a smoke test.
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT_DIR = 'docs/screenshots';
const DEMO = { email: 'demo@sleeptrack.app', password: 'DemoPass123' };
const ADMIN = { email: 'admin@sleeptrack.app', password: 'AdminPass123' };

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const failures = [];

async function open(browser, { viewport, colorScheme }) {
  const context = await browser.newContext({
    baseURL: BASE_URL,
    viewport,
    colorScheme,
    deviceScaleFactor: 2,
    timezoneId: 'Asia/Beirut',
    locale: 'en-US',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(`${page.url()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => failures.push(`${page.url()}: ${error.message}`));
  return page;
}

async function signIn(page, credentials) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(credentials.email);
  await page.getByLabel('Password', { exact: true }).fill(credentials.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/dashboard**');
}

async function shoot(page, path, name, { fullPage = false } = {}) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);
  if (fullPage) {
    // Grow the viewport rather than using `fullPage`, so the sticky sidebar spans the whole shot.
    const viewport = page.viewportSize();
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width: viewport.width, height });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT_DIR}/${name}.png` });
    await page.setViewportSize(viewport);
  } else {
    await page.screenshot({ path: `${OUT_DIR}/${name}.png` });
  }
  console.log(`  ${name}.png  ${path}`);
}

const browser = await chromium.launch();
mkdirSync(OUT_DIR, { recursive: true });

try {
  console.log('Public pages');
  const guest = await open(browser, { viewport: DESKTOP, colorScheme: 'dark' });
  await shoot(guest, '/', 'landing');
  await shoot(guest, '/login', 'login');
  await shoot(guest, '/register', 'register');
  await guest.context().close();

  console.log('App (midnight theme)');
  const dark = await open(browser, { viewport: DESKTOP, colorScheme: 'dark' });
  await signIn(dark, DEMO);
  await shoot(dark, '/dashboard', 'dashboard');
  await shoot(dark, '/journal', 'journal');
  await dark.goto('/journal');
  const firstNight = dark.getByRole('row').getByRole('link').first();
  const nightHref = await firstNight.getAttribute('href');
  if (nightHref) await shoot(dark, nightHref, 'night-detail');
  await shoot(dark, '/analytics', 'analytics', { fullPage: true });
  await shoot(dark, '/insights', 'insights');
  await shoot(dark, '/reports', 'weekly-report');
  await shoot(dark, '/goals', 'goals');
  await shoot(dark, '/tags', 'tags');
  await shoot(dark, '/settings', 'settings-profile');
  await shoot(dark, '/settings/preferences', 'settings-preferences');
  await shoot(dark, '/settings/security', 'settings-security');
  await shoot(dark, '/settings/data', 'settings-data');
  await dark.goto('/dashboard');
  await dark.waitForLoadState('networkidle');
  await dark.keyboard.press('ControlOrMeta+k');
  await dark.waitForTimeout(400);
  await dark.screenshot({ path: `${OUT_DIR}/command-menu.png` });
  console.log('  command-menu.png');
  await dark.context().close();

  console.log('App (dawn theme)');
  const light = await open(browser, { viewport: DESKTOP, colorScheme: 'light' });
  await signIn(light, DEMO);
  await shoot(light, '/dashboard', 'dashboard-dawn');
  await shoot(light, '/analytics', 'analytics-dawn');
  await light.context().close();

  console.log('Mobile');
  const mobile = await open(browser, { viewport: MOBILE, colorScheme: 'dark' });
  await signIn(mobile, DEMO);
  await shoot(mobile, '/dashboard', 'mobile-dashboard');
  await shoot(mobile, '/journal', 'mobile-journal');
  await mobile.context().close();

  console.log('Admin');
  const admin = await open(browser, { viewport: DESKTOP, colorScheme: 'dark' });
  await signIn(admin, ADMIN);
  await shoot(admin, '/admin', 'admin');
  await admin.context().close();
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(`\n${String(failures.length)} console error(s):`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exitCode = 1;
} else {
  console.log('\nNo console errors.');
}
