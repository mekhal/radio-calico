# Tests

Tests written before code, per the AI-DLC loop's TDD principle (see
[README.md](../README.md#2-core-principles)): a failing test is written first for the agreed
Acceptance Criteria, then the code is written to make it pass.

## Framework: hand-written vanilla JavaScript, no npm

Per `docs/decisions/2026-07-12-testing-framework-vanilla-runner.md`, this project has no npm
tooling — tests are plain JavaScript, and there is no Jest/Mocha/etc. Two files provide the
harness:

- **`assert.js`** — a minimal `describe`/`it`/`expect` runner (globals, no imports/exports).
  `it()` callbacks may be `async`. Results collect into `window.TestHarness.getResults()`.
- **`test-runner.html`** — the **Test Report page**. It loads the harness, the app's CDN
  dependencies, a mocked `window.Hls`, and every `tests/*.test.js` file, then renders a
  pass/fail list on the page.

**Tests run only on demand** — never automatically when `index.html` loads, and never via an
`npm test` script. `index.html`'s footer has a "Test Report" button (issue #41) that opens an
in-app modal and runs a suite on demand, injecting the harness/fixture DOM directly into the page
(no `<iframe>`) so a reviewer can check results without any local install step.
`tests/test-runner.html` still runs the full suite on load and remains the fallback/CI entry
point.

Since issue #67 (AC2), the modal's suite is scoped to tests that exercise `app.js`'s own
HTML/DOM interface functions (`tests/test-report-suite-files.js` is the single source of truth
for that list). Tests with no app/DOM surface — the harness's own self-test
(`harness-serialization.test.js`) and doc-content assertions
(`skills-storage-in-repo.test.js`) — are wired directly into `tests/test-runner.html` instead, so
they still run as part of the full report, just not the footer modal. The modal groups results as
a list per test suite with a sub-list per case, so it reads as "what's tested" rather than a flat
list of assertions.

If a test needs "the database," it mocks `localStorage` directly — only as far as the
Acceptance Criteria under test requires, nothing extra.

## Running the tests

Open `tests/test-runner.html` in a browser (e.g. via a static file server, or directly from
disk). The page runs the suite on load and renders results.

### Doc-content assertions (e.g. `skills-storage-in-repo.test.js`)

A ticket with no app/DOM surface (docs-only or process changes) is still tested per TDD —
the assertion just reads sibling repo files via `fetch()` and checks their text instead of
exercising `app.js`. This means that specific suite needs `test-runner.html` served over
http(s) (a static file server); opening it via `file://` fails those fetches in most browsers
regardless of the docs' content, since local-file fetch is blocked by `file://` CORS policy.
