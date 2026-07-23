<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/pr-followup-on-pr-not-issue/SKILL.md
Surfaced while closing issue #98 (parent story) — the underlying decision was made directly on
this thread on 2026-07-16 (see docs/decisions/2026-07-16-pr-followups-on-pr-not-issue.md) but
had not yet been distilled into a skill file.
-->
<!-- BEGIN SKILL.md -->
---
name: pr-followup-on-pr-not-issue
description: Use when a Code/Test PR is already open and the human wants a change to it — comment on that PR, never the parent issue, so the fix lands on the existing branch instead of a new one; also recognize that branch merge/delete is a human-only manual git operation.
---

The harness always creates a brand-new branch when triggered from an issue comment, but pushes
directly onto the existing branch when triggered from an open PR's comment. So:

- Once a PR is open for a piece of work, any follow-up (`@claude review`/`approved`/fixes) must be
  requested **on that PR**, not on the parent issue — otherwise a stray duplicate branch gets
  created for no reason.
- If asked to merge two branches together or delete a branch, say plainly that this is outside
  what the agent can do (merging/deleting branches is a manual git operation, not a file write) —
  do not attempt a workaround that risks discarding either branch's work. Point out which branch
  the open PR is against, since deleting that one will auto-close the PR.
- If you notice a thread's own follow-up work landed on a fresh issue-triggered branch instead of
  the open PR's branch, flag it rather than silently proceeding, so the human can decide whether to
  consolidate manually.
<!-- END SKILL.md -->
