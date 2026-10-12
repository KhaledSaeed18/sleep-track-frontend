import { mkdirSync, writeFileSync } from 'node:fs';
import { request, type FullConfig } from '@playwright/test';
import { USER_FILE, type TestUser } from './fixtures';

/** Registers one throwaway account per run for the specs that change data. */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL ?? 'http://localhost:3000';
  const user: TestUser = {
    email: process.env.E2E_EMAIL ?? `e2e+${String(Date.now())}@sleeptrack.app`,
    password: process.env.E2E_PASSWORD ?? 'NightOwl-2026',
    firstName: 'Ellie',
    lastName: 'Tester',
  };

  if (!process.env.E2E_EMAIL) {
    const api = await request.newContext({ baseURL });
    const response = await api.post('/api/v1/auth/register', {
      data: {
        email: user.email,
        password: user.password,
        first_name: user.firstName,
        last_name: user.lastName,
        timezone: 'Asia/Beirut',
      },
    });
    if (!response.ok())
      throw new Error(
        `Could not register the e2e user (${String(response.status())}): ${await response.text()}`,
      );
    await api.dispose();
  }

  mkdirSync('e2e/.auth', { recursive: true });
  writeFileSync(USER_FILE, JSON.stringify(user));
}
