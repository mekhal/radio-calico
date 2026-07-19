# Decision: AI Review Evaluation Framework introduced as an experimental trial, not a `CLAUDE.md` rule

**Issue:** [#119](https://github.com/mekhal/aidlc-radio-calico/issues/119)
**Decided by:** @mekhal, 2026-07-19

## Decision

A new `ai-review-evals/` folder at repo root holds a reusable template (`TEMPLATE.md`) and
explanatory `README.md` for recording **AI decisions** (not code quality, not model performance)
made during AI-assisted work, so a human can review them later. Key choices made across this
issue's review rounds:

1. **Scope of what's recorded** — only *meaningful* AI decisions: judgment calls with consequences
   beyond the literal instruction (scope choices, refactors, added features/accessibility changes,
   convention changes, architectural assumptions). Routine tool calls are not logged.
2. **Scoring** — `Instruction Fidelity` and `Result Satisfaction` are always left blank at
   creation; only a human fills them in. The agent never self-scores, to avoid the framework
   grading its own homework.
3. **Taxonomy** — `AI Decision` and `Decision Type` keyword lists are lightweight and extensible,
   not a fixed enum. Consistency is preferred over completeness: reuse an existing keyword when it
   reasonably fits, add a new one only when nothing applies.
4. **Granularity** — one **new** file per `@claude close` event (a log of evaluations), grouped by
   **issue** (not per-PR, since the framework measures the AI's decision on that issue, and one
   issue can spawn multiple PRs).
5. **Filename** — `YYYY-MM-DD_HHMM_issue-<N>_<short-title>.md` (hyphen before the issue number,
   for human readability).
6. **Model field** — raw model id (e.g. `claude-sonnet-5`), not a human-readable label.
7. **Coverage** — every `@claude close` produces a file, including issues closed without a PR
   (plan-only / discussion-only), since the framework evaluates the decision, not the code.
8. **Trial status, not a hard rule (yet)** — this issue does **not** add "create an eval file" as
   a mandatory line item to `CLAUDE.md`'s `@claude close` row. Once this feature is merged, the
   agent follows the practice manually for issues in the trial. A follow-up issue can promote it
   to a permanent `CLAUDE.md` rule and/or a `.claude/skills/` skill once enough evaluation data
   has accumulated to justify it.

## Why

Requested by the human to support an evidence-based move from **Human Review Everything** to
**Human Review Risk** — every closed loop should leave a record an auditor can scan later without
re-reading the whole PR, with Risk Level and Instruction Fidelity as the triage signal. Trial
status (over an immediate hard rule) was chosen deliberately: the human wants to see the framework
actually work across a batch of real evaluations before locking in permanent process weight, since
self-scoring or a premature fixed taxonomy would risk making the framework either untrustworthy
(AI grading itself) or brittle (a taxonomy that doesn't fit decisions not yet seen).

## Impact

- New `ai-review-evals/TEMPLATE.md` — verbatim copy of the issue's AC3 template.
- New `ai-review-evals/README.md` — purpose, trial status, what gets recorded, filename
  convention, and the extensible taxonomy note.
- No change to `CLAUDE.md`'s `@claude close` table row in this pass — this stays a manually
  followed trial practice, not an enforced rule, until a future issue promotes it.
- Test PR waived for this issue (docs/template-only change with nothing to unit test in the
  vanilla-JS `tests/` runner) — went straight to a Code PR.
