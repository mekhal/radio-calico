# Decision: Mitigate the CLAUDE.md-revert risk with a commit-time check; the workflow root cause needs human investigation

**Issue:** [#106](https://github.com/mekhal/aidlc-radio-calico/issues/106)
**Decided by:** @mekhal, 2026-07-17 (approved after a `@claude review` analysis the same day)

## Decision

Issue #106 reports that the job working tree's `CLAUDE.md` was repeatedly, silently reset to `develop`'s version (byte-identical diff against `develop`, even though `git log`/`HEAD` and every other file were correct) across four consecutive job runs on PR #102. The suspected mechanism is the workflow's first `actions/checkout@v4` step targeting `ref: develop` (`.github/workflows/claude.yml`), possibly combined with `claude-code-action@v1` reading/restoring `CLAUDE.md` from that ref rather than the PR branch — but this was **not reproduced** in the review job and remains unconfirmed.

Because the fix would live in `.github/workflows/claude.yml`, which the agent cannot write to (write-guard boundary, same category as `.claude/`), this issue's Code PR does not change the workflow. Instead it adds a defensive Hard rule to `CLAUDE.md`: always run `git diff --cached -- CLAUDE.md` and confirm the diff is intended before staging/committing any change to that file.

## Why

- The issue's own evidence shows a scenario where the working tree can diverge from the branch's actual `HEAD` for this one file without `git status`/`HEAD` flagging anything unusual elsewhere — a blind `git add`/commit in that state could silently overwrite already-merged human decisions in `CLAUDE.md` (the exact risk the issue's "Why this matters" section calls out).
- Confirming the actual root cause requires adding temporary debug steps (`git status`, `git diff --stat`, `git log -1 -- CLAUDE.md`) around the `claude-code-action` step in `.github/workflows/claude.yml` and re-running on a PR that reproduces the issue — visibility and write access the agent doesn't have.

## Impact

- `CLAUDE.md` Hard rules gains the check-before-commit rule specific to `CLAUDE.md`.
- `README.md` / `README.th.md` Rules of Engagement sections synced with the same note.
- No workflow changes were made — root cause remains **open**. A human should, when convenient: (1) add temporary debug steps to `claude.yml` and re-run on an affected PR, (2) try dropping `ref: develop` from the first checkout to see if the symptom disappears, and (3) check `anthropics/claude-code-action` release notes/source for documented base-ref `CLAUDE.md` handling (possible prompt-injection defense reading `CLAUDE.md` from the trusted base ref instead of the PR branch). Any confirmed finding should be captured as a follow-up decision or new issue.
