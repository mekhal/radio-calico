# Decision: Split a large story's AC into sequential sub-issue tickets, each running its own Test PR → Code PR loop

**Issue:** [#20](https://github.com/mekhal/aidlc-radio-calico/issues/20) — "Listen Now" button on hero
**Decided by:** @mekhal, 2026-07-12

## Decision

When a story's approved AC is too large for one reviewable Test PR/Code PR pair, split it into sequential **native GitHub sub-issues** (`gh api repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<id>`, integer id via `-F`, not string via `-f`) under the parent issue. Each sub-issue runs the full step 4→7 loop (Test PR → approval → Code PR → review/merge) independently, in dependency order when later tickets' tests assert against DOM the earlier tickets introduce. The parent issue stays open until all sub-issue tickets are implemented and merged to `develop`.

Issue #20 was split into:
- **Ticket A** ([#24](https://github.com/mekhal/aidlc-radio-calico/issues/24)) — Listen Now button + single playback control
- **Ticket B** ([#25](https://github.com/mekhal/aidlc-radio-calico/issues/25)) — status indicators + error recovery (depends on A)
- **Ticket C** ([#26](https://github.com/mekhal/aidlc-radio-calico/issues/26)) — dark/light theme toggle + footer (depends on B)

## Why

The full AC (single control, indicators, error recovery, theme toggle, footer) would have produced one large, hard-to-review Code PR, violating `CLAUDE.md`'s "review-sized PRs" / "split large work into multiple tickets" rule. Sequencing (not parallelizing) A→B→C avoided writing later tickets' tests against DOM markup that didn't exist yet.

## Gotcha to watch for next time

A sub-issue's Test PR merging is **not** the same as its Code PR merging — issue #26 stayed open with only its Test PR (step 4) merged for a while, giving the false impression the ticket was done. Before treating a sub-issue ticket as finished, verify its Code PR actually merged into `develop` (check the implementation is in the code, not just that failing tests exist), not just that its Test PR did.

## Impact

- Worth a reusable skill: "split-story-into-ticket-loop" — the sub-issue creation + native linking command, the sequencing rule, and the Test-PR-vs-Code-PR completeness check above.
