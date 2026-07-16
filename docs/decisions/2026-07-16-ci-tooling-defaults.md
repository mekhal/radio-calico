# Decision: CI tooling defaults taken under `@claude approved skip to PR code`, and one AC deferred

**Issue:** [#67](https://github.com/mekhal/aidlc-radio-calico/issues/67) — เพิ่ม Lint (Mega-Linter) และ Security Scan (Trivy)
**Decided by:** @mekhal (via `@claude approved skip to PR code`), 2026-07-16

## Decision

The step-3 review round left four open questions (Q2–Q4 plus an AC2
clarification). The human's next comment was `@claude approved skip to PR
code` — an explicit instruction to skip the Test PR (step 4) and go straight
to a Code PR (step 6), per `CLAUDE.md`'s step 3 option, but it didn't answer
the open questions individually. Rather than block on that, the agent
proceeded using its own previously-proposed defaults for the questions that
had no blocking conflict, and deferred the one that did conflict with
already-merged work:

1. **Q2 (does "no `npm install`" cover CI/dev-tooling?)** — treated as
   confirmed: no objection was raised after two rounds, and both
   Mega-Linter/Trivy are container actions needing no `package.json` anyway.
2. **Q3 (ticket split)** — kept as two separate Code PRs (footer buttons vs.
   CI workflow drafts) per `CLAUDE.md`'s "split large work into multiple
   tickets ... so a human can actually review each PR" — this is independent
   of whether a Test PR exists.
3. **Q4 (fail CI vs. report-only on first round)** — defaulted to
   **report-only / non-blocking** (`DISABLE_ERRORS: true` for Mega-Linter,
   `exit-code: 0` for Trivy). Rationale: this codebase has never been linted
   or scanned, so the first run is expected to surface many findings; making
   either blocking is left for a follow-up issue once findings are triaged.
4. **AC2 clarification — deferred, not implemented in this round.** The prior
   review round proposed trimming the footer Test Report modal's injected
   suite (`tests/test-report-suite-files.js`) down to only
   HTML-page-behavior tests, removing `harness-serialization.test.js` and
   `skills-storage-in-repo.test.js`. While implementing, the agent found this
   conflicts with already-merged work from issue #54:
   `tests/test-report-suite-completeness.test.js` is a regression test
   written specifically to require `skills-storage-in-repo.test.js` to stay
   in `TEST_REPORT_SUITE_FILES` (that file was "never wired anywhere" before
   issue #54's fix — see
   [[2026-07-15-test-report-live-verification-and-suite-file-fixes]]).
   Removing it now would silently revert that fix and would also require
   deleting or rewriting its guard test. The agent did not do this
   unilaterally; AC2's modal-trim is left out of this Code PR pending
   explicit human confirmation (see the open question below).

## Why

- `CLAUDE.md`: "if you have any doubt, ask the human before they approve —
  do not assume" applies most strongly when acting on an assumption would
  **revert a previously merged, deliberately tested fix**. The other
  defaults (Q2–Q4) are reversible/low-risk (config values, PR count) and
  match what was already proposed and not objected to across two review
  rounds, so the agent proceeded on `@claude approved skip to PR code` rather
  than stalling the loop a third time.
- **Reuse-first / traceability**: keeping the two-ticket split and citing the
  #54 decision doc keeps this round's PRs reviewable and keeps the reasoning
  traceable instead of re-deriving it.

## Impact

- `app.js`: adds two footer links (`footer-lint-report-link`,
  `footer-security-report-link`), both `<a target="_blank" rel="noopener
  noreferrer">` pointing at `reports/lint/megalinter-report.html` and
  `reports/security/trivy-report.html` respectively — paths chosen to match
  where `docs/ci-drafts/mega-linter.yml` / `trivy.yml` publish once a human
  installs them (see `docs/ci-drafts/README.md`).
- `tests/footer-lint-report-link.test.js`,
  `tests/footer-security-report-link.test.js`: new tests, added to
  `tests/test-report-suite-files.js`.
- `docs/ci-drafts/mega-linter.yml`, `docs/ci-drafts/trivy.yml`,
  `docs/ci-drafts/README.md`: drafted workflow YAML + install instructions,
  per the write-guard workaround (agent cannot write under
  `.github/workflows/`).
- **`tests/test-report-suite-files.js` modal trim is NOT done in this
  round.** Open question for the human: do you want
  `skills-storage-in-repo.test.js` removed from the modal's suite anyway
  (which means also retiring/rewriting
  `tests/test-report-suite-completeness.test.js`, reverting part of issue
  #54), or should only `harness-serialization.test.js` be excluded from the
  modal (re-wired directly into `tests/test-runner.html`, the same treatment
  already given to five other self-referential files)? The agent's
  reading is that "ลบส่วนที่ไม่เกี่ยวข้องออก" most likely meant the latter, and can implement it as a
  quick follow-up once confirmed.
