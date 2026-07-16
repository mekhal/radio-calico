# Decision: Follow-up changes go on the open PR, not the parent issue — and branch merge/delete is human-only

**Issue:** [#98](https://github.com/mekhal/aidlc-radio-calico/issues/98) (Ticket A, #99, Code PR [#102](https://github.com/mekhal/aidlc-radio-calico/pull/102))
**Decided by:** @mekhal, 2026-07-16

## Decision

1. Once a Test PR or Code PR is open for a loop, any follow-up `@claude` request for that work must be posted **on the PR itself**, not on the parent issue. Commenting on the issue instead causes the harness to spin up a brand-new branch, leaving the already-open PR's branch untouched and creating an unwanted duplicate.
2. Merging one branch into another, and deleting a branch, are git operations the agent **cannot** perform (only creating/pushing commits to a branch). When two branches end up duplicating the same work, a human consolidates them manually (`git merge` + `git push` + `git push origin --delete <branch>`), being mindful that deleting a branch with an open PR against it auto-closes that PR.

## Why

On #98, a `@claude review` comment asked to merge branch `claude/issue-98-20260716-1626` (which had the complete, already-reviewed Ticket A implementation as PR #102) into `claude/issue-99-20260716-1553` (no PR, an older/smaller duplicate attempt) and delete the former. The agent could not perform the merge/delete, and the duplicate branch existed in the first place because the follow-up had been triggered on the issue rather than on the open PR.

## Impact

- `CLAUDE.md` Hard rules and the Branching subsection now call out commenting on the PR (not the issue) for follow-ups, and that branch merge/delete is human-only.
- `README.md` / `README.th.md` Branching tables synced with the same note.
