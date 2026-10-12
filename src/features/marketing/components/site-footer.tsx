import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { siteConfig } from '@/config/site';

export function SiteFooter() {
  return (
    <footer className="border-t border-(--hairline)">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm text-base-content/60">
            A calm, private sleep journal with analytics that explain your nights.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">Product</h2>
          <ul className="space-y-2 text-sm text-base-content/65">
            <li>
              <Link href="/#features" className="link link-hover">
                Features
              </Link>
            </li>
            <li>
              <Link href="/#analytics" className="link link-hover">
                Analytics
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="link link-hover">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">Account</h2>
          <ul className="space-y-2 text-sm text-base-content/65">
            <li>
              <Link href="/register" className="link link-hover">
                Create an account
              </Link>
            </li>
            <li>
              <Link href="/login" className="link link-hover">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/forgot-password" className="link link-hover">
                Reset password
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">About</h2>
          <ul className="space-y-2 text-sm text-base-content/65">
            <li>
              <Link href="/privacy" className="link link-hover">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="link link-hover">
                Terms
              </Link>
            </li>
            <li>
              <a
                href={siteConfig.links.github}
                className="link link-hover"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source code
              </a>
            </li>
            <li>
              <a
                href={siteConfig.links.portfolio}
                className="link link-hover"
                target="_blank"
                rel="noopener noreferrer"
              >
                Case study
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-(--hairline)">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-base-content/50 sm:px-8">
          © {new Date().getFullYear()} {siteConfig.author.name}. Built as an open-source portfolio
          project. Not medical advice.
        </p>
      </div>
    </footer>
  );
}
