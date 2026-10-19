# CLAUDE.md

Next.js 15 (App Router) frontend of a personal finance app: transactions, categories, analytics and an AI chat. Talks only to the BFF (`BFF_BASE_URL` in `src/constants`). Solo project.

## Commands
- `npm run verify` - lint, typecheck, unit tests and build in one go. Use this to verify.
- `npm run dev` / `npm run build` / `npm run lint` / `npm run typecheck` / `npm test`
- `npx jest src/utils/format-date.test.ts` - one test file
- `npm run test:e2e` exists but there are no Cypress tests in the repo.

## Architecture
- `app/` routes and page-level components; `src/components/` shared and feature components; `src/components/ui/` shadcn/ui primitives (customized, edit with care).
- Server state: TanStack Query. One file per endpoint in `src/queries/<domain>/`: `useX.ts` hooks export a `KEY`; mutations are plain async functions using `api` from `src/utils/api.ts`.
- `src/utils/api.ts` is the only HTTP client (Axios, cookies, 401 -> single logout + redirect via `handleSessionExpiry`).
- Client state: Zustand stores in `src/stores/`. Types in `src/types/`.
- `middleware.ts` only checks the `session_id` cookie exists; real auth is in the BFF.
- Tests: Jest + Testing Library + MSW (`src/tests/`), render with `src/utils/test-utils.tsx`.

## Conventions
- No semicolons (ESLint `semi: never`; the edit hook runs `eslint --fix` on the file).
- Do not run Prettier on whole files or the repo: most files predate `.prettierrc` and the diff would bury the change.
- Imports via `@/` (maps to `src/`).
- Tests live next to the file they test (`foo.ts` -> `foo.test.ts`).

## Things Claude gets wrong
- After a transaction mutation, call `invalidateTransactionQueries(queryClient)` (`src/queries/transactions/`), not a bare `queryClient.invalidateQueries()`, which refetches auth and AI queries too. A new transaction-derived query must add its `KEY` there.
- Trusting `npm run build` as a typecheck: `next.config.ts` sets `ignoreBuildErrors` and `ignoreDuringBuilds`, so it passes with type and lint errors. Run `npm run typecheck`.
- Creating axios instances or calling `fetch` directly instead of `api` (breaks session-expiry handling). Streaming chat is the only exception and already reuses `handleSessionExpiry`.
- Reading or referencing `stack.env`: `next.config.ts` loads it into `env`, and anything referenced from client code is inlined into the public bundle.

## Verifying your work
Before saying a task is done, run `npm run verify` and paste the relevant output (the summary line plus any failure). If something fails, say so; do not call the task done.
Known baseline failures (not caused by your change, fix only if the task is about them): 1 lint error (`src/tests/setup.ts`, `no-namespace`) and 8 type errors in `src/components/ui/chart.tsx` (recharts 3 types). Any failure beyond these is yours.

## Process
Non-trivial changes follow `docs/sdlc/README.md`: `/sdlc-intent` -> `/sdlc-spec` -> `/sdlc-plan` -> implement -> `/sdlc-review` -> commit. Review rules: `REVIEW.md`.
