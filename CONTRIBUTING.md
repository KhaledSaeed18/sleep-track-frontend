# Contributing

Thanks for taking the time to improve SleepTrack.

## Setup

Follow the [quick start](README.md#quick-start). You need Node.js 24, pnpm 12 and, for end-to-end
tests, the backend's Docker Compose stack.

## Workflow

1. Branch from `main`: `feat/<topic>`, `fix/<topic>` or `chore/<topic>`.
2. Keep changes focused. Put code in the feature it belongs to (`src/features/<feature>`), and only
   promote it to `components/`, `hooks/` or `lib/` once a second feature needs it.
3. If the API changed, run `pnpm api:generate` and commit the updated `src/types/api.d.ts`.
4. Before pushing, run:

   ```bash
   pnpm check          # lint, type-check, unit tests
   pnpm format:check
   pnpm test:e2e       # when you touched a user flow
   ```

5. Open a pull request. CI must be green.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):
`feat(journal): add tag filter`, `fix(auth): ...`, `test: ...`, `docs: ...`, `chore(deps): ...`.
Write the subject in the imperative and explain the why in the body when it is not obvious.

## Code style

- TypeScript strict mode and the strict typescript-eslint preset. No `any`; prefer narrowing over
  non-null assertions.
- Server data goes through TanStack Query hooks in the feature's `hooks/`; never call the API from
  a component directly.
- Forms use react-hook-form with a zod schema in the feature's `schemas/`, and map server errors
  onto fields with `applyServerErrors`.
- Render dates through `useFormatters()` so they follow the user's time zone and clock preference.
- Use daisyUI components and the theme tokens; avoid hard-coded colours so both themes keep working.
- Every interactive element needs an accessible name. Tests should query by role and label.

## Tests

- Pure logic: a `*.test.ts` next to the file.
- Components and hooks: Testing Library with the MSW handlers from `src/mocks`.
- User flows: a Playwright spec in `e2e/`. Specs must leave no console errors.
