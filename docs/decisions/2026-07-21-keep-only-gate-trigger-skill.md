# Decision: keep only the `gate-trigger-vs-intent-mismatch` skill candidate from issue #100's close

**Issue:** [#100](https://github.com/mekhal/aidlc-radio-calico/issues/100)
**Decided by:** @mekhal, 2026-07-21

## Decision

At issue #100's close, two new-skill candidates were surfaced: `gate-trigger-vs-intent-mismatch`
and `preserve-tested-styles-add-accent`. The human chose to keep only
`gate-trigger-vs-intent-mismatch`; `preserve-tested-styles-add-accent` is skipped.

The kept candidate's draft is at
`docs/knowledge-asset/published/gate-trigger-vs-intent-mismatch.md`, awaiting a human to commit it
to `.claude/skills/gate-trigger-vs-intent-mismatch/SKILL.md` per the write-guard workaround.

## Why

No reason was given beyond the explicit instruction; recorded as-is so the choice isn't
re-litigated or re-proposed in a future close.

## Impact

- `preserve-tested-styles-add-accent` is not drafted as a skill file and should not be re-proposed
  from this issue's history.
- No code changes — this is a process-only decision.
