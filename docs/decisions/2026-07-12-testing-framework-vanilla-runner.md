# Decision: Tests are hand-written vanilla JS, run only from a Test Report page

**Issue:** [#20](https://github.com/mekhal/aidlc-radio-calico/issues/20) — "Listen Now" button on hero
**Decided by:** @mekhal, 2026-07-12

## Decision

- Unit tests and integration tests are hand-written **vanilla JavaScript** — no Jest, no npm test framework.
- If a test needs a "database," it mocks `localStorage` — only as far as the AC under test requires, nothing extra.
- Test files live under `tests/`.
- Tests run only when a dedicated **Test Report page** (`tests/test-runner.html`) is opened directly in a browser — never automatically on app load, never via an `npm test` script.
- The landing page (`index.html`) links to the Test Report page (e.g. in the footer) so a reviewer can click through from the app to see results.

## Why

The human decided this to keep the repo's "no npm" constraint consistent between app code and test code, and to make test results reviewable by simply opening a page in a browser — no local tooling required to verify a PR.

## Impact

- The Test PR opened under the earlier `claude/issue-20-20260712-1105` branch (Jest + jsdom + React Testing Library) is superseded — that branch has since been deleted. Issue #20's Test PR is written from scratch as vanilla JS against this decision.
- `tests/README.md` documents the harness and how to run it.
