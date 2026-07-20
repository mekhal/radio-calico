# Decision: AI Review Evaluation Framework promoted from experimental trial to mandatory practice

**Issue:** [#99](https://github.com/mekhal/aidlc-radio-calico/issues/99)
**Decided by:** @mekhal, 2026-07-20

## Decision

The `ai-review-evals/` framework, introduced as an experimental trial under issue #119 (see
`docs/decisions/2026-07-19-ai-review-evaluation-framework-trial.md`), is promoted to a mandatory
step of `CLAUDE.md`'s `@claude close` flow. Every `@claude close` now logs one new entry in
`ai-review-evals/`, using the existing `TEMPLATE.md` and `README.md` convention unchanged
(filename pattern, auto-filled vs. human-filled fields, taxonomy) — this decision only removes the
"trial, not yet enforced" caveat, it does not change how the framework itself works.

`ai-review-evals/README.md`'s status section is updated from "experimental trial" to "standard
practice," and `CLAUDE.md` gains a new top-level "AI review evaluations" section plus a reference
from the `@claude close` gate-table row. `README.md` / `README.th.md` gain a short pointer to the
framework in the Skill Capture & Reuse section.

This close event (issue #99) is itself the first mandatory entry — it was also used to backfill
the entry that was missed at #99's prior close on 2026-07-20T06:26 (see
`ai-review-evals/2026-07-20_0945_issue-99_footer-fixed-position-icon-links.md`), since the trial
framework was already merged to `develop` by then but not yet consistently followed.

## Why

The trial decision (#119) deliberately deferred making this mandatory until "the framework
actually work[s] across a batch of real evaluations." The human's close-out review of issue #99
supplied the first real human-scored evaluation (Instruction Fidelity 3/5, Result Satisfaction
3/5, with specific review notes on over-implementation) and, in the same comment, asked to bring
"เรื่องการประเมิน" (the evaluation topic) into `CLAUDE.md` — read as approval to promote the
framework now that it has produced usable signal, rather than waiting for a larger batch.

## Impact

- `CLAUDE.md`: new "AI review evaluations" section; `@claude close` gate-table row now references
  it.
- `ai-review-evals/README.md`: status section changed from "experimental trial" to "standard
  practice."
- `README.md` / `README.th.md`: Skill Capture & Reuse section gains a short pointer.
- New `ai-review-evals/2026-07-20_0945_issue-99_footer-fixed-position-icon-links.md` — backfills
  the entry missed at #99's earlier close, using the human's scores/notes from this close event.
- No change to the framework's internal mechanics (taxonomy, scoring rules, filename convention).
