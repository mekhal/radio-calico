<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/gate-trigger-vs-intent-mismatch/SKILL.md
Surfaced while closing issue #100 (Ticket B). Kept per human decision on #100 (2026-07-21) —
the sibling candidate `preserve-tested-styles-add-accent` proposed in the same close comment was
explicitly not kept.
Decision record: docs/decisions/2026-07-21-keep-only-gate-trigger-skill.md
-->
<!-- BEGIN SKILL.md -->
---
name: gate-trigger-vs-intent-mismatch
description: Use when a human's trigger command (e.g. `@claude review`) and the surrounding message text seem to ask for a different gate (e.g. approval to write code) — pause and clarify instead of guessing which one wins.
---

If the literal trigger word (`review` / `approved` / `close`) implies one action but the message
text around it reads like a different one, do not silently pick an interpretation. Post what each
reading would mean, state which one you're following by default (the literal trigger), and ask the
human to confirm with the correct trigger if that's wrong. Never write code or open a PR on the
ambiguous turn.
<!-- END SKILL.md -->
