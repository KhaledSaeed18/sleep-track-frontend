# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-10-12

A ground-up rewrite on Next.js 16, React 19, Tailwind CSS 4 and daisyUI 5 against the v2 API.

### Added

- Landing page, privacy and terms pages, SEO metadata, sitemap, robots, generated Open Graph images
  and a web manifest.
- Authentication: sign-in with remember-me, registration with password strength, email
  verification, password reset, Google sign-in when enabled by the API, and a one-click live demo.
- Typed API client generated from the backend's OpenAPI schema, with an in-memory access token,
  single-flight token refresh, CSRF headers and unified error handling.
- App shell with a collapsible sidebar, a mobile dock, a command menu, keyboard shortcuts and a
  running-timer indicator.
- Dashboard with the most recent night, score breakdown, sleep timer, key stats, a 30-night trend
  and the goal streak.
- Sleep timer with backdating and a morning check-in.
- Journal with search, date, quality and tag filters, sorting, pagination, bulk delete and export,
  plus a night detail page with a timeline and score explanation.
- Analytics with selectable ranges: nightly trend, sleep window, weekday patterns, distributions, tag
  impact, chronotype and a year heatmap. Each chart has a table view.
- Insights grouped by topic, weekly reports with print and email, goals with age-based
  recommendations, and tag management.
- Settings for profile, preferences, security (password, devices, activity) and data (export,
  import, account deletion).
- Admin area with usage stats, a sign-up chart and user management.
- Midnight and Dawn themes that follow the system setting without a flash on load.
- In-browser mock API (MSW) for offline development.
- Vitest unit and component tests, a Playwright suite against the real API, and a screenshot script
  that smoke-tests every page.
- Multi-stage Docker image, Docker Compose file, GitHub Actions CI and Dependabot.

### Removed

- The v1 app, Axios, Chart.js, react-icons and the retro theme.
