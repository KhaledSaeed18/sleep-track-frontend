import { vi } from 'vitest';

export const router = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};
export let searchParams = new URLSearchParams();

export function setSearchParams(value: string) {
  searchParams = new URLSearchParams(value);
}

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  useSearchParams: () => searchParams,
  usePathname: () => '/',
}));
