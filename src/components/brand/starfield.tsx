import { cn } from '@/lib/utils';

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  twinkle: boolean;
  delay: number;
}

function makeStars(count: number, seed: number): Star[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    r: rand() < 0.08 ? 1.3 : 0.5 + rand() * 0.6,
    o: 0.25 + rand() * 0.55,
    twinkle: rand() < 0.18,
    delay: rand() * 6,
  }));
}

/** Deterministic, static star layer. Rendered on the server; only a few stars twinkle. */
export function Starfield({
  count = 90,
  seed = 7,
  className,
}: {
  count?: number;
  seed?: number;
  className?: string;
}) {
  const stars = makeStars(count, seed);
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <svg className="h-full w-full" preserveAspectRatio="none">
        {stars.map((star, index) => (
          <circle
            key={index}
            cx={`${star.x.toFixed(2)}%`}
            cy={`${star.y.toFixed(2)}%`}
            r={star.r}
            fill="var(--color-base-content)"
            opacity={star.o}
            className={star.twinkle ? 'animate-twinkle' : undefined}
            style={star.twinkle ? { animationDelay: `${star.delay.toFixed(2)}s` } : undefined}
          />
        ))}
      </svg>
    </div>
  );
}
