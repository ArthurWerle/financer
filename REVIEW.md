# REVIEW.md

How changes in this repo are reviewed, by `/sdlc-review`, by the reviewer agent in CI, or by hand. Solo project: the goal is catching real defects, not enforcing taste.

## Severity
- **Important**: blocks the merge. A bug with a concrete failure path, a security or privacy problem, a requirement from spec.md not met, behavior outside plan.md, new logic without a test, a verify failure introduced by the change, or the verify output not shown.
- **Nit**: does not block. Naming, readability, small simplifications, comments. At most 5 per review; pick the ones that matter most and drop the rest.

Every Important finding states the failure path (input or state -> wrong result). If you cannot describe one, it is a Nit or nothing. Pre-existing problems in untouched code are not findings; mention them in one line at the end at most.

## Pass 1: Bugs and correctness
- Edge cases in the UI data: empty lists, loading and error states, zero and negative amounts, month boundaries, recurring vs one-off transactions.
- Currency and dates go through the existing helpers (`number-to-currency`, `format-date`, `to-rfc3339`, `add-date`); no ad hoc `toFixed` or `new Date(string)` parsing in new code.
- TanStack Query: correct query keys, invalidation through `invalidateTransactionQueries` when transaction data changes, no stale data after a mutation.
- React: effects with correct dependencies, no state updates after unmount, keys on lists, no request in render.
- API contract with the BFF: request and response shapes match `src/types/`.
- Tests: new behavior has a test that would fail without the change; typecheck has no new errors.

## Pass 2: Security and privacy
- No secrets or tokens in code, tests, logs or docs; nothing secret referenced through `process.env` in client code (it gets inlined in the bundle).
- No `dangerouslySetInnerHTML` or raw HTML from API or AI output; markdown goes through the existing `markdown.tsx` renderer.
- All HTTP goes through `src/utils/api.ts` (cookies, 401 handling).
- No financial data written to `console.log` beyond what already exists, or to `localStorage` without a reason in the spec.

## Pass 3: Conformance with spec and plan
Only when the change has `docs/sdlc/<slug>/`; otherwise check against CLAUDE.md conventions only.
- Every requirement R1..Rn is implemented and covered by a test or a stated manual check.
- Every changed file is listed in plan.md's "Files that change". Unlisted files are Important unless trivially incidental (imports, a test helper), in which case they are Nits.
- The "Proof" items were run and their output was shown.
- Points of attention in spec.md were handled, not just acknowledged.
- CLAUDE.md "Things Claude gets wrong" items were not repeated.

## Output
Verdict (`ready` or `changes needed`), then Important, then Nits, then the requirement table. `ready` means zero Important findings.
