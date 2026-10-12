import { Lightbulb, Moon } from 'lucide-react';
import Link from 'next/link';
import { NightArc } from '@/components/brand/night-arc';
import { Starfield } from '@/components/brand/starfield';
import { ScoreRing } from '@/components/ui/score-ring';
import { DemoButton } from '@/features/auth/components/demo-button';

/** The horizon behind the hero. It draws itself once on load; reduced motion shows it static. */
function Horizon() {
  const length = 2200;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 560"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-x-0 bottom-0 h-[78%] w-full"
    >
      <defs>
        <linearGradient id="hero-horizon" x1="0" x2="1">
          <stop offset="0" stopColor="var(--color-secondary)" stopOpacity="0.0" />
          <stop offset="0.25" stopColor="var(--color-secondary)" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="var(--color-primary)" stopOpacity="0.6" />
          <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M -40 560 A 760 520 0 0 1 1480 560"
        fill="none"
        stroke="url(#hero-horizon)"
        strokeWidth="1.5"
        strokeDasharray={length}
        className="animate-arc-draw"
        style={{ ['--arc-length' as string]: String(length) }}
      />
      <path
        d="M -40 560 A 760 520 0 0 1 1480 560 L 1480 560 L -40 560 Z"
        fill="var(--glow-primary)"
        opacity="0.25"
      />
    </svg>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
      <div className="surface-glass glow-ring animate-rise p-5 [animation-delay:250ms] sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Last night</p>
            <p className="text-xs text-base-content/55">Night of Sunday, October 11</p>
          </div>
          <span className="badge badge-soft badge-sm badge-success">Goal met</span>
        </div>
        <div className="sky-gradient mt-4 rounded-box border border-(--hairline) px-5 pt-5 pb-3">
          <NightArc
            progress={1}
            fill={0.86}
            startLabel="In bed 23:12"
            endLabel="Up 07:04"
            className="mx-auto max-w-xs"
          >
            <span className="text-4xl font-semibold tracking-tight">7h 41m</span>
            <span className="mt-0.5 text-xs text-base-content/60">asleep</span>
          </NightArc>
        </div>
        <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-4">
          <ScoreRing value={86} size="4.5rem" thickness="0.4rem" label="Sleep score">
            <span className="text-xl font-semibold">86</span>
          </ScoreRing>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              ['Fell asleep', '12 min'],
              ['Woke up', 'once'],
              ['Mood', 'Refreshed'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-field bg-base-200/70 px-2 py-2">
                <dt className="text-[0.65rem] text-base-content/55">{label}</dt>
                <dd className="text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="surface-glass absolute top-[calc(100%-1.5rem)] -left-4 hidden w-64 animate-rise p-4 [animation-delay:700ms] sm:block lg:-left-12">
        <div className="flex gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-warning/12 text-warning">
            <Lightbulb className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Late coffee costs you</p>
            <p className="mt-0.5 text-xs text-base-content/65">
              Quality drops 0.9 points on nights tagged Caffeine.
            </p>
          </div>
        </div>
      </div>

      <div className="surface-glass absolute -top-5 -right-3 hidden animate-rise items-center gap-2 rounded-full px-4 py-2 text-sm [animation-delay:950ms] sm:flex">
        <Moon className="size-4 text-accent" />
        <span className="tabular font-medium">Timer 6:12:40</span>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="sky-gradient relative isolate overflow-hidden" aria-labelledby="hero-title">
      <Starfield count={120} seed={3} className="-z-10" />
      <div className="-z-10">
        <Horizon />
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 pt-16 pb-36 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-24 lg:pb-44">
        <div className="animate-rise">
          <h1 id="hero-title" className="max-w-xl font-display text-display font-semibold">
            See what your nights are telling you.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-base-content/75">
            Log sleep in seconds, or tap the timer at bedtime. SleepTrack scores every night, finds
            the habits behind your best and worst ones, and helps you keep a steadier schedule.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/register" className="btn btn-lg btn-primary">
              Create a free account
            </Link>
            <DemoButton variant="ghost" className="border-(--hairline) btn-lg" />
          </div>
          <p className="mt-4 text-sm text-base-content/55">
            The demo opens a private account with 90 nights of sample data.
          </p>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}
