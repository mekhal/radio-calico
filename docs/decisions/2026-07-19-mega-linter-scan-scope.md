# Decision: Mega-Linter scan scope narrowed, PR diff-only, weekly full scan

**Issue:** [#120](https://github.com/mekhal/aidlc-radio-calico/issues/120) — Speed up Mega-Linter
**Decided by:** @mekhal (via step-3 review, then `@claude approved` with option (b)), 2026-07-19

## Decision

1. **`.mega-linter.yml` (AC1 + AC5)** — added at the repo root, `ENABLE`d
   only for this repo's *decided* tech stack (HTML, CSS, JavaScript,
   Markdown, YAML, PowerShell — `docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md`),
   not gated on which file types currently exist. CSS and PowerShell are
   enabled even though no `.css` file or `scripts/scaffold.ps1` exists yet,
   because both are already committed-to in `CLAUDE.md`/the style guide —
   the comments in the file explain this so a future contributor knows the
   list tracks the stack *decision*, not the file tree, and should only
   change if that decision changes.
2. **`VALIDATE_ALL_CODEBASE` (AC2)** — split by trigger, per the human's
   explicit option (b):
   - `pull_request → develop`: diff-only (`false`).
   - `push → develop`: full scan (`true`), unchanged.
   - `push → main`: Mega-Linter **removed** from this trigger entirely.
   - new weekly `schedule` trigger (`cron: "0 3 * * 0"`, runs against the
     default branch): full scan, and this is now the **only** trigger that
     publishes the report into `main` (commit + sync back to `develop`).
   Implemented as a single conditional expression,
   `VALIDATE_ALL_CODEBASE: ${{ github.event_name != 'pull_request' }}`,
   rather than duplicating the job per trigger.
3. **AC3 reframed as behavior verification, not runtime measurement** — per
   the human's step-3 review, dropped the before/after duration capture.
   Verification is: after this draft is copied into
   `.github/workflows/mega-linter.yml`, confirm on a real PR that only
   changed files are validated, confirm a `develop` push still runs a full
   scan, and confirm the first scheduled run publishes the report to `main`
   and syncs it back to `develop`. Documented here rather than as a
   pre-merge test (see "No Test PR" below).
4. **Mega-Linter "flavor" image change — split out of this ticket's scope**,
   per the human's step-3 review. Not evaluated or implemented here; a
   candidate for a separate issue if wanted later.
5. **`DISABLE_ERRORS: true` unchanged (AC4)** — out of scope, per the
   existing `docs/decisions/2026-07-16-ci-tooling-defaults.md` decision.
6. **Pages report reframed as a periodic snapshot, not a per-merge
   artifact** — per the human's explicit instruction on the approval
   comment, `docs/ci-drafts/README.md`'s design notes and the workflow's own
   header comment now describe the weekly schedule as the sole
   publish/refresh path for the GitHub Pages report.

## Why

- **Reuse-first / minimal surface area**: a single `env` expression
  (`github.event_name != 'pull_request'`) covers all three trigger cases
  instead of three near-duplicate jobs.
- **`push → main` full scan was the main cost without much signal**: a
  `develop → main` merge is human-gated and expected to carry little/no new
  diff versus what `develop`'s own full scan already covers, so a weekly
  cadence trades a small freshness cost for removing a full scan from every
  production release.
- CLAUDE.md's Definition of Done requires AC tests where practical, but
  workflow YAML has no runnable pre-merge test harness in this repo (see
  `docs/decisions/2026-07-12-testing-framework-vanilla-runner.md` — the
  vanilla test runner has no way to execute GitHub Actions). The prior
  `docs/ci-drafts/README.md` ("What's NOT covered here") already established
  this precedent for issues #67/#87: CI workflow tickets are verified
  post-merge by observing real runs, not via a Test PR. AC3's reframing to
  "behavior verification" (this round's own step-3 decision) confirms the
  same approach applies here, so this Code PR proceeds directly per that
  precedent rather than opening a separate Test PR.

## Incidental fix discovered while implementing

`docs/ci-drafts/mega-linter.yml` was missing the "Sync report commit back
into develop" step that exists in the live
`.github/workflows/mega-linter.yml` — the two had drifted out of sync
despite `docs/ci-drafts/README.md` describing the folder as "kept in sync."
Restored in this same PR since the weekly-schedule design in AC2 depends on
that step existing (not a separate out-of-scope fix).

## Impact

- `.mega-linter.yml`: new file, repo root.
- `docs/ci-drafts/mega-linter.yml`: trigger/env/condition changes described
  above; a human must `cp` this into `.github/workflows/mega-linter.yml`
  per `docs/ci-drafts/README.md` (workflow files are outside the agent's
  write permissions).
- `docs/ci-drafts/README.md`: design notes updated to describe the new
  trigger split and the "periodic snapshot" framing.
