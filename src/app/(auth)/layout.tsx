import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '@/components/brand/logo';
import { NightArc } from '@/components/brand/night-arc';
import { Starfield } from '@/components/brand/starfield';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col bg-base-100 px-6 py-6 sm:px-10">
        <Link href="/" className="w-fit rounded-field" aria-label="SleepTrack home">
          <Logo />
        </Link>
        <main id="main" className="flex flex-1 items-center justify-center py-12">
          {children}
        </main>
        <p className="text-xs text-base-content/50">
          <Link href="/privacy" className="link link-hover">
            Privacy
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <Link href="/terms" className="link link-hover">
            Terms
          </Link>
        </p>
      </div>

      <aside
        className="sky-gradient relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-end"
        aria-hidden="true"
      >
        <Starfield count={110} seed={11} />
        <div className="relative mx-auto w-full max-w-lg px-12 pb-20">
          <NightArc
            progress={0.62}
            fill={0.62}
            startLabel="23:10"
            endLabel="07:05"
            className="opacity-95"
          >
            <span className="tabular font-display text-5xl font-semibold">7h 41m</span>
            <span className="mt-1 text-sm text-base-content/60">last night</span>
          </NightArc>
          <blockquote className="mt-14">
            <p className="font-display text-2xl leading-snug">
              The best bedtime is the one you can keep. SleepTrack shows you which one that is.
            </p>
          </blockquote>
        </div>
      </aside>
    </div>
  );
}
