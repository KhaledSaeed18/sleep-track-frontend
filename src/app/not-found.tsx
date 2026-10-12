import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { NightArc } from '@/components/brand/night-arc';
import { Starfield } from '@/components/brand/starfield';

export default function NotFound() {
  return (
    <main
      id="main"
      className="sky-gradient relative isolate grid min-h-dvh place-items-center overflow-hidden px-6"
    >
      <Starfield count={80} seed={404} className="-z-10" />
      <div className="flex max-w-md flex-col items-center text-center">
        <Link href="/" aria-label="SleepTrack home" className="mb-12">
          <Logo />
        </Link>
        <NightArc progress={0.5} fill={0} className="w-64" />
        <h1 className="mt-8 font-display text-4xl font-semibold">This page drifted off</h1>
        <p className="mt-3 text-base-content/70">
          The link may be old or mistyped. Head back and pick up from somewhere familiar.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
          <Link href="/dashboard" className="btn btn-primary">
            Open dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
