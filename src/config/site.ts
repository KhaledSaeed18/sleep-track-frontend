export const siteConfig = {
  name: 'SleepTrack',
  title: 'SleepTrack: understand your nights',
  description:
    'Log your sleep in seconds, see the patterns behind good and bad nights, and build a steadier routine with clear analytics and weekly reports.',
  url: (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  author: { name: 'Khaled Saeed', url: 'https://khaledsaeed.tech' },
  links: {
    portfolio: 'https://khaledsaeed.tech/work/sleep-track',
    github: 'https://github.com/KhaledSaeed18/sleep-track-frontend',
    backend: 'https://github.com/KhaledSaeed18/sleep-track-backend',
  },
  contactEmail: 'hello@sleeptrack.app',
} as const;
