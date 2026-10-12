import { CalendarRange, Download, Gauge, MoonStar, Tags, Timer } from 'lucide-react';
import Link from 'next/link';
import { Starfield } from '@/components/brand/starfield';
import { DemoButton } from '@/features/auth/components/demo-button';

const FEATURES = [
  {
    icon: Timer,
    title: 'Log a night in seconds',
    body: 'Tap the timer when you go to bed and again when you wake, or enter times by hand. Add quality, mood and tags if you like; nothing is required.',
  },
  {
    icon: Gauge,
    title: 'A score that explains itself',
    body: 'Every night gets a 0 to 100 score built from duration, quality, how fast you fell asleep, awakenings and how close you stayed to your bedtime.',
  },
  {
    icon: Tags,
    title: 'The habits behind good nights',
    body: 'Tag caffeine, workouts, late meals or stress. SleepTrack compares nights with and without each tag so you can see what actually helps.',
  },
  {
    icon: MoonStar,
    title: 'A steadier schedule',
    body: 'Consistency, sleep debt, streaks and your chronotype show whether your rhythm is drifting, and by how much, before you feel it.',
  },
  {
    icon: CalendarRange,
    title: 'A weekly report worth opening',
    body: 'Each Monday, a short summary of last week: your best and toughest nights, what changed and one thing to try. Read it in the app or by email.',
  },
  {
    icon: Download,
    title: 'Your data stays yours',
    body: 'Export everything as CSV or JSON whenever you want, import from other trackers, and delete your account with one confirmation.',
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20" aria-labelledby="features-title">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2
            id="features-title"
            className="font-display text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Less tracking, more understanding.
          </h2>
          <p className="mt-5 max-w-md text-lg text-base-content/70">
            Most sleep apps collect numbers. SleepTrack is built around the question you actually
            have in the morning: why did last night go the way it did?
          </p>
        </div>
        <ul className="divide-y divide-(--hairline) border-y border-(--hairline)">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="grid gap-4 py-7 sm:grid-cols-[2.75rem_1fr]">
              <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
                <feature.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-1.5 leading-relaxed text-base-content/70">{feature.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const STEPS = [
  {
    title: 'Log tonight',
    body: 'Start the timer at bedtime or add the night tomorrow morning. Tag anything that might matter.',
  },
  {
    title: 'Read the morning',
    body: 'See your score, how you compared with your goal and what stood out, all on one screen.',
  },
  {
    title: 'Adjust the week',
    body: 'Insights and the weekly report point at one change at a time, so you can try it and see if it works.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-(--hairline) bg-base-100"
      aria-labelledby="how-title"
    >
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <h2
          id="how-title"
          className="max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          Three steps, every night.
        </h2>
        <ol className="mt-14 grid gap-10 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <span className="font-display text-5xl font-semibold text-primary" aria-hidden="true">
                {index + 1}
              </span>
              <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-base-content/70">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const WEEKDAYS = [
  ['Mon', 6.9],
  ['Tue', 7.2],
  ['Wed', 7.0],
  ['Thu', 6.8],
  ['Fri', 7.9],
  ['Sat', 8.4],
  ['Sun', 7.6],
] as const;

const IMPACTS = [
  ['Meditation', 0.8],
  ['Reading', 0.5],
  ['Exercise', 0.3],
  ['Screen time', -0.4],
  ['Alcohol', -0.7],
  ['Caffeine', -0.9],
] as const;

function WeekdayFigure() {
  const max = 9;
  return (
    <figure className="surface p-6">
      <figcaption className="mb-1 font-semibold">Weekday patterns</figcaption>
      <p className="mb-6 text-sm text-base-content/60">Average hours asleep, sample data</p>
      <div
        className="flex h-44 items-end justify-between gap-3"
        role="img"
        aria-label="Sample chart: sleep is longest on Friday and Saturday nights at around 8 hours, shortest on Thursday at 6.8 hours."
      >
        {WEEKDAYS.map(([day, hours]) => (
          <div key={day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="tabular text-xs text-base-content/60">{hours}h</span>
            <span
              className="w-full max-w-6 rounded-t-[4px]"
              style={{ height: `${String((hours / max) * 100)}%`, background: 'var(--chart-1)' }}
            />
            <span className="text-xs text-base-content/60">{day}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

function ImpactFigure() {
  return (
    <figure className="surface p-6">
      <figcaption className="mb-1 font-semibold">What changes your nights</figcaption>
      <p className="mb-6 text-sm text-base-content/60">
        Quality on tagged nights compared with the rest
      </p>
      <ul className="space-y-3" aria-label="Sample tag impact">
        {IMPACTS.map(([tag, value]) => (
          <li key={tag} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3 text-sm">
            <span className="text-base-content/80">{tag}</span>
            <span className="relative h-3">
              <span className="absolute inset-y-[-4px] left-1/2 w-px bg-base-content/20" />
              <span
                className="absolute inset-y-0 rounded-[4px]"
                style={{
                  background: value > 0 ? 'var(--chart-1)' : 'var(--chart-3)',
                  left: value > 0 ? '50%' : `${String(50 + value * 50)}%`,
                  width: `${String(Math.abs(value) * 50)}%`,
                }}
              />
            </span>
            <span className="tabular text-right text-base-content/70">
              {value > 0 ? '+' : '−'}
              {Math.abs(value).toFixed(1)}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function AnalyticsShowcase() {
  return (
    <section id="analytics" className="scroll-mt-20" aria-labelledby="analytics-title">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="max-w-2xl">
          <h2
            id="analytics-title"
            className="font-display text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Charts that answer a question.
          </h2>
          <p className="mt-5 text-lg text-base-content/70">
            Trends over a week or a year, when you really fall asleep, how weekends shift your clock
            and which habits move your quality up or down. Every chart has a table view, too.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <WeekdayFigure />
          <ImpactFigure />
        </div>
      </div>
    </section>
  );
}

export const FAQS = [
  {
    q: 'Do I need a wearable?',
    a: 'No. SleepTrack works with the times you enter or the in-app timer. If you already use a tracker, you can import its export as CSV.',
  },
  {
    q: 'How is the sleep score calculated?',
    a: 'Duration against your goal counts for 40%, quality 25%, time to fall asleep 15%, awakenings 10% and bedtime against your goal window 10%. Anything you skip is left out and the rest is re-weighted.',
  },
  {
    q: 'Which night does a session belong to?',
    a: 'The date the night began. If you go to bed after midnight but before noon, it still counts toward the previous evening, so a 1am bedtime on Saturday is Friday night.',
  },
  {
    q: 'What does the live demo do?',
    a: 'It creates a private, temporary account filled with about 90 nights of realistic sample data, so you can explore every screen without entering anything.',
  },
  {
    q: 'Is my data private?',
    a: 'Your nights are only visible to you. Sessions are stored server-side, access tokens live in memory, and you can export or delete everything at any time.',
  },
  {
    q: 'Is this medical advice?',
    a: 'No. SleepTrack helps you notice patterns. If you have ongoing trouble sleeping, talk to a doctor.',
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-20 border-y border-(--hairline) bg-base-100"
      aria-labelledby="faq-title"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <h2
          id="faq-title"
          className="font-display text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          Questions, answered.
        </h2>
        <div className="join w-full join-vertical">
          {FAQS.map((item, index) => (
            <div
              key={item.q}
              className="collapse-plus collapse join-item border border-(--hairline)"
            >
              <input type="radio" name="faq" defaultChecked={index === 0} aria-label={item.q} />
              <h3 className="collapse-title font-semibold">{item.q}</h3>
              <div className="collapse-content leading-relaxed text-base-content/70">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="sky-gradient relative isolate overflow-hidden" aria-labelledby="cta-title">
      <Starfield count={70} seed={21} className="-z-10" />
      <div className="mx-auto max-w-3xl px-5 py-28 text-center sm:px-8">
        <h2
          id="cta-title"
          className="font-display text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          Tonight is a good night to start.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-base-content/70">
          Free, private, and ready before your next bedtime.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="btn btn-lg btn-primary">
            Create a free account
          </Link>
          <DemoButton variant="ghost" className="border-(--hairline) btn-lg" />
        </div>
      </div>
    </section>
  );
}
