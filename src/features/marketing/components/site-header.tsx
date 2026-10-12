import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { HeaderCta } from './header-cta';

const LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#analytics', label: 'Analytics' },
  { href: '/#faq', label: 'FAQ' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-(--hairline) bg-base-200/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
        <Link href="/" aria-label="SleepTrack home" className="rounded-field">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-field px-3 py-2 text-base-content/70 transition-colors hover:text-base-content"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <HeaderCta />
        </div>
      </div>
    </header>
  );
}
