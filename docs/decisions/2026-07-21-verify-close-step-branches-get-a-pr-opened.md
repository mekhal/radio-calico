# Decision: Require a real PR for close-step branches, and check prior-turn branches for missed PRs

**Issue:** [#135](https://github.com/mekhal/aidlc-radio-calico/issues/135)
**Decided by:** @mekhal, 2026-07-21

## Decision

1. When handling `@claude close`, the agent must **actually open a PR** (`gh pr create --base develop`) for the close-step branch carrying the decision doc + AI review eval entry, before the close comment is considered done. Posting a compare link alone is not sufficient.
2. On any new `@claude` trigger for a thread, the agent must check whether branch/PR references posted in that thread's earlier turns actually resulted in an opened PR (`git ls-remote origin <branch>`, `gh pr list --state all --head <branch>`), and flag any that didn't in the current turn's comment.

## Why

While closing issue #100, a docs-only close-step branch (`claude/issue-100-20260721-0930`) had its AI review eval + a decision doc drafted and pushed, but no PR was ever opened — both files stayed on an orphaned branch and never reached `develop`. It only surfaced because the human asked why the AI review eval scoring wasn't showing up. A second close-step branch that same day (`claude/issue-100-20260721-0942`) did get its PR opened and merged (#134), so the gap is intermittent rather than universal — meaning a documented requirement, plus a check at the next trigger, are both needed as a safety net.

## Impact

- `CLAUDE.md`: `@claude close` row and "AI review evaluations" section now require actually opening the PR; new Hard rules bullet requires checking prior-turn branches for missed PRs on every new trigger.
- `README.md` / `README.th.md` (Thai canonical): Rules of Engagement and the "AI review evaluations" paragraph mirror both additions; the pre-existing summary gap (missing close-time field list and the Instruction Fidelity/Result Satisfaction blank rule) was reconciled at the same time.
- Docs-only change — no `src/`/`tests/` impact.
