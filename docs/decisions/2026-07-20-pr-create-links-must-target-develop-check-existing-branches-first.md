# Decision: manual "Create PR" links must target `develop`, and check for an existing branch/PR before re-implementing an already-approved change

**Issue:** [#99](https://github.com/mekhal/aidlc-radio-calico/issues/99) (Ticket A — fixed footer)
**Decided by:** @mekhal, across the 2026-07-16 → 2026-07-19 review rounds on this issue

## Decision

1. **Any PR-creation link the agent posts — not just `gh pr create --base develop` — must
   compare against `develop`, never `main`.** This includes the plain-text
   `.../compare/BASE...branch?quick_pull=1` link posted in a comment when no PR has been
   opened yet. A link of the form `compare/main...branch` hides commits that only exist on
   `main` (e.g. the Mega-Linter report-publish commit) from the diff preview, so a branch
   that was accidentally cut from `main`'s tip (the standing issue #106 checkout bug, see
   [[2026-07-17-sync-to-develop-before-work-mitigation]]) can look clean right up until the
   PR is actually opened against the correct base — at which point unrelated commits appear
   mixed into what the human expected to be an isolated change.
2. **Before re-implementing an already-approved change, check whether a prior branch/PR for
   the same instruction already exists** (`gh pr list --state all --search "<issue> in:body"`,
   or branches matching `claude/issue-<N>-*`). If one exists and its diff is still valid
   against the current `develop` tip, reuse it (e.g. cherry-pick the relevant commit onto a
   fresh `develop`-based branch) instead of writing the change again from scratch.

## Why

The same "merge GitHub/LinkedIn into one footer group + add tests" change was correctly
implemented **four separate times** on this issue (branches from 2026-07-17 05:49, 2026-07-17
15:39, 2026-07-19 02:37, and 2026-07-19 02:53) because each resulting PR was closed or never
opened, and each retry started from a blank slate rather than checking whether a valid diff
already existed on an earlier branch. The eventual root cause of the human's "commit อื่นมาปน"
(unrelated commits mixed in) report was that one of those branches had been cut from `main`'s
tip instead of `develop`'s (issue #106), and the `compare/main...branch` link the agent had been
posting never surfaced that divergence for review. The fix that finally landed cleanly
(2026-07-19T03:13 comment) was to reset a fresh branch to `origin/develop`'s tip, cherry-pick
only the one relevant commit, and post a `compare/develop...branch` link instead — after which
the PR showed exactly the intended 3-file diff.

This refines (not replaces) [[2026-07-12-pr-base-branch-must-be-develop]], which already
requires `--base develop` for PRs opened via `gh pr create`; the gap this issue surfaced is that
the same rule was not being applied to manually-typed compare-URL links posted before any PR
object exists.

## Impact

- `CLAUDE.md`'s PR-base-branch hard rule now explicitly calls out manually-posted compare
  links, not just `gh pr create --base develop`.
- No code changes — this is a process-only decision about how the agent constructs PR links
  and whether it checks for prior work before re-implementing.
