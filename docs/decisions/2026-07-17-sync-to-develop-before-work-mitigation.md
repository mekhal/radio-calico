# Decision: Sync the job's working tree to `origin/develop` before any work — standing mitigation for the checkout-lands-on-`main` bug

**Issue:** [#106](https://github.com/mekhal/aidlc-radio-calico/issues/106)
**Decided by:** @mekhal, 2026-07-17

## Decision

Root-cause investigation of this bug is being reported to Anthropic separately and is out of scope for the agent to fix (it lives inside `anthropics/claude-code-action@v1` / requires changes to `.github/workflows/claude.yml`, which the agent cannot write). Until it is fixed upstream, every agent job must, **before making any file changes**:

1. Compare `HEAD` to `origin/develop` (`git diff HEAD origin/develop --stat`, or check `git merge-base HEAD origin/develop`).
2. If they diverge **and** the current branch has no existing remote history of its own (`git ls-remote origin <branch>` is empty — a fresh branch with nothing to lose), run `git reset --hard origin/develop` to sync before editing any files.
3. If the branch already has commits pushed to its own remote (e.g. follow-up work on an already-open PR), do **not** force-reset — that would be destructive to real work. Stop and flag the mismatch to the human instead.
4. After syncing, re-verify with `git diff origin/develop --stat` before staging/committing, to confirm only the intended files are changed.

## Why

Across 6 investigation rounds on issue #106, every job triggered from an issue comment landed with `HEAD` pointing at `origin/main` (the repo's default branch) instead of `origin/develop` — regardless of whether `ref: develop` was present in `.github/workflows/claude.yml`'s first checkout step, and regardless of the `develop` → `main` merge strategy (squash vs. rebase). The mechanism inside `claude-code-action@v1`'s branch-creation-from-issue flow could not be confirmed from the agent side (no access to the action's internal logs, and its vendored source under `/home/runner/work/_actions/` is outside the agent's allowed working directory). The human decided to report the root cause to Anthropic directly rather than keep spending loop cycles on agent-side investigation, and asked instead for a standing fix that lets work proceed safely in the meantime — turning the ad-hoc workaround used once in a prior run on this issue into a documented, repeatable rule.

## Impact

- `CLAUDE.md` Hard rules: new bullet requiring the sync-and-verify step before any edits, plus a note in the Branching subsection.
- `README.md` / `README.th.md`: Branching table rows synced with the same note.
- The underlying bug in `.github/workflows/claude.yml` / `claude-code-action@v1` remains **unconfirmed and unfixed** — this is a mitigation of the effect, not a fix of the cause. See the review comments on issue #106 for the full investigation history (ref-develop removal/restore test, squash-vs-rebase-merge test, issue-trigger-vs-PR-trigger comparison).
