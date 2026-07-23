# Decision: Verify branch ancestry via `merge-base`/`rev-parse`, not `diff --stat` alone or GitHub's compare-to-`main` link

**Issue:** [#101](https://github.com/mekhal/aidlc-radio-calico/issues/101)
**Decided by:** Surfaced through repeated false-positive/false-negative cycles on issue #101, 2026-07-22 through 2026-07-23; no single human decision comment, but the pattern recurred often enough (three separate "you didn't rebase from develop" reports, one of which turned out correct and two of which didn't) to warrant recording as a refinement of the existing checkout-bug mitigation.

## Decision

When verifying whether a branch is correctly based on `origin/develop` (per the standing issue #106 mitigation in `docs/decisions/2026-07-17-sync-to-develop-before-work-mitigation.md`), two specific check methods are **not sufficient on their own** and produced wrong conclusions on this issue's thread:

1. **`git diff HEAD origin/develop --stat` being empty does not prove the branch is parented on `develop`.** If `main` and `develop` happen to have identical trees at that moment (e.g. right after a squash-merge landed the same content on both), a branch mistakenly cut from `main`'s tip will show an empty diff against `develop` too — "confirmed synced" was reported once on this basis and was wrong; the branch's actual parent commit was `main`'s tip, not `develop`'s. Always cross-check with `git merge-base origin/develop HEAD` — the result must equal `origin/develop`'s current tip (or an ancestor reachable through `HEAD`'s own history), not just match by content.
2. **GitHub's "N commits ahead of / M commits behind `main`" compare-link summary, posted in a comment, is not evidence about a branch's relationship to `develop`.** On this issue, `main` and `develop` independently accumulated commits with identical titles but different hashes (content landed on `main` outside of a `develop`→`main` release merge at least twice), so `compare/main...branch` links showed apparent divergence for branches that were, on inspection via `merge-base origin/develop <branch>`, cleanly and correctly based on `develop` with a clean diff. Two of three "you didn't rebase" reports on this thread were this false positive; only investigating the actual commit graph (not the compare link's summary numbers) resolved each one correctly.

The correct check, before concluding a branch needs fixing:

```
git merge-base origin/develop <ref>   # must be origin/develop's current tip (or reachable ancestor)
git diff origin/develop <ref> --stat  # should show only the intended files
```

Do this even when the report says "ahead of/behind `main`" — translate it to a `develop`-relative check before acting, and say so explicitly when replying, since the human-visible compare link only ever defaults to `main`.

## Why

Three separate turns on issue #101 (2026-07-22T07:09, 2026-07-22T08:17, 2026-07-23T03:19) involved the human reporting a branch as incorrectly based, citing a `compare/main...branch` link. One of the three was a genuine issue #106 checkout-bug instance; the other two were false positives caused by `main`/`develop` divergence unrelated to that turn's branch. Reaching the correct answer each time required inspecting `git merge-base`/`git log --oneline` directly rather than trusting either the diff-only check or the compare-link summary — both of which independently produced a wrong read at least once in this thread.

## Impact

- No `CLAUDE.md` rule change proposed yet — this doc refines the *methodology* used to satisfy the existing sync-check Hard rule; it does not change the rule's substance (still: sync fresh branches to `develop`, never force-reset branches with pushed history).
- Surfaced as a new-skill candidate at this issue's `@claude close` — see the close comment on issue #101 for the proposed `SKILL.md` draft, pending the human's add/update/skip decision.
- `main` and `develop` have since been reconciled (PR #146, human-merged `develop` → `main` on 2026-07-23) — as of this doc, `origin/develop`'s tip is an ancestor of `origin/main`'s tip again, so the specific divergence that caused the false positives is currently resolved. This check remains worth applying going forward since nothing prevents the same divergence from recurring.
