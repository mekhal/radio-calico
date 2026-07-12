# Decision: Test PR / Code PR base branch must always be `develop`, never `main`

**Issue:** [#20](https://github.com/mekhal/aidlc-radio-calico/issues/20) (PR [#27](https://github.com/mekhal/aidlc-radio-calico/pull/27), Ticket A Test PR)
**Decided by:** @mekhal, 2026-07-12

## Decision

When opening a Test PR or Code PR for any AI-DLC loop, the AI must explicitly set the PR base branch to `develop` (e.g. `gh pr create --base develop`, or `gh pr edit --base develop` to fix one already open). Never rely on the tool's/GitHub's default base branch.

## Why

PR #27 (this issue's Test PR) was opened with base `main` by mistake — the default base branch was never overridden. The human caught this before merge and asked for it to be retargeted, per `CLAUDE.md`'s existing rule that `develop` → `main` is a human-only production release and no PR should ever point at `main`.

## Impact

- `CLAUDE.md`'s Hard rules now call out explicitly setting `--base develop` as a required step when opening a Test PR or Code PR, so this mistake doesn't recur.
- `README.md` / `README.th.md` Branching tables synced with the same note.
