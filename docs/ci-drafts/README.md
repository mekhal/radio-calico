# CI workflow drafts (issue #67)

`mega-linter.yml` and `trivy.yml` in this folder are **drafts**, not live workflows.
Per `CLAUDE.md`'s write-guard note, the Claude agent cannot write under
`.github/workflows/` — a human must copy these files into that path.

## How to install

1. Copy both files into `.github/workflows/`:
   ```
   cp docs/ci-drafts/mega-linter.yml .github/workflows/mega-linter.yml
   cp docs/ci-drafts/trivy.yml .github/workflows/trivy.yml
   ```
2. In repo Settings → Actions → General → Workflow permissions, make sure
   **"Read and write permissions"** is selected. Both workflows commit the
   published report back into `main` using the default `GITHUB_TOKEN`, which
   needs write access to do that.
3. Commit and push the two files on a branch, open a PR into `develop` as
   normal.

## Design notes (why they're shaped this way)

- **Two triggers, two purposes.** Push/PR into `develop` gives fast lint/scan
  feedback while developing. Push into `main` (which only happens after a
  human's `develop` → `main` merge — merging into `main` stays human-only per
  `CLAUDE.md`) re-runs the scan and publishes the report by committing it into
  `main`, because this repo's GitHub Pages is legacy branch-based (`main`,
  path `/`) with no Actions-based deploy — confirmed by reading the repo's
  actual Pages settings (`build_type: legacy`, `source.branch: main`,
  `source.path: /`).
- **Report paths match the footer links already in `app.js`:**
  `reports/lint/megalinter-report.html` and
  `reports/security/trivy-report.html`, both at the site root so they resolve
  once published to `main`.
- **No infinite loop.** The publish step's commit uses the default
  `GITHUB_TOKEN`, never a PAT or deploy key. GitHub does not trigger further
  workflow runs from a `GITHUB_TOKEN` push by design, so there's no
  push → CI → commit → push → CI loop. `paths-ignore: reports/**` on the
  `push` trigger is a second, redundant layer of the same protection — keep
  both; don't swap the token for a PAT to "fix" something that isn't broken.
- **Non-blocking (report-only) on this first round.** `DISABLE_ERRORS: true`
  (Mega-Linter) and `exit-code: 0` (Trivy) mean neither job fails CI on
  findings yet. Since no code in this repo has ever been linted or scanned,
  the first run is expected to surface a lot of findings; making these
  blocking is left for a follow-up issue once findings are triaged. See
  `docs/decisions/2026-07-16-ci-tooling-defaults.md`.
- **No `npm install` anywhere.** Both actions are container-based
  (`oxsecurity/megalinter@v8`, `aquasecurity/trivy-action`) and need no
  `package.json` or npm dependency in this repo, consistent with
  `docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md`.
- **Test coverage is intentionally absent** from both drafts — out of scope
  per the issue and `docs/decisions/2026-07-12-testing-framework-vanilla-runner.md`.

## What's NOT covered here

These workflow YAML files cannot be exercised by this repo's vanilla test
runner (`tests/test-runner.html` has no way to run GitHub Actions), so per the
human's "skip to PR code" instruction on issue #67 there is no separate Test
PR for this ticket. Verify by: copying the files in, pushing to `develop`, and
confirming the workflow runs and uploads a report artifact; then, after a
`develop` → `main` merge, confirming the report lands at
`reports/lint/megalinter-report.html` / `reports/security/trivy-report.html`
on `main` and the footer links on the live site resolve.
