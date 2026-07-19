# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#119](https://github.com/mekhal/aidlc-radio-calico/issues/119) |
| PR | [#122](https://github.com/mekhal/aidlc-radio-calico/pull/122) |
| Date | 2026-07-19 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | |

---

## Task

Create the AI Decision Evaluation Framework itself: a repository-root `ai-review-evals/` folder
that, after `@claude close`, gets one Markdown evaluation file per completed task, recording the
AI's decision context (not code quality) for later human review.

---

## Original User Request

> This evaluation records AI decisions, not code quality. Human review remains the source of
> truth.

Create `ai-review-evals/` at repo root; after `@claude close`, generate one Markdown file per task
using the specified template (Metadata, Task, Original User Request, AI Decision, Decision Type,
Risk Level, Instruction Fidelity, Result Satisfaction, Human Decision, Review Notes, Future
Policy, Lessons Learned).

---

## AI Decision

1. Built the template as a standalone, reusable `TEMPLATE.md` plus an explanatory `README.md`
   (reuse-first) instead of inlining the AC3 template directly into `CLAUDE.md` — a structural
   choice not explicitly requested, made so future close events read from one canonical source.
2. Initially leaned toward encoding "create an eval file at close" as a permanent `CLAUDE.md`
   rule, then reversed that lean after the human's review answer and recommended experimental/
   trial status instead — documented as its own decision in
   `docs/decisions/2026-07-19-ai-review-evaluation-framework-trial.md` rather than silently
   changing the plan.
3. At this close event, treated `docs/decisions/` (process/meta decisions about how the framework
   itself works) and `ai-review-evals/` (per-close records of the AI's own decisions) as two
   separate, non-overlapping artifact types per the human's clarification — this file is the
   first concrete instance of that separation: the framework's design decisions stayed in
   `docs/decisions/`, and this file is where the AI's own decision record lives instead.

Suggested Keywords:

- reuse-first template extraction

- reversed own prior recommendation after human feedback

- separating process-decision records from AI-decision records

---

## Decision Type

Introducing a new project convention (a third documentation artifact type alongside
`docs/decisions/` and `docs/knowledge-asset/`) and making an architectural assumption about how
process decisions and AI-decision records should be kept apart.

Suggested Keywords:

- changing project conventions

- making architectural assumptions

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)

-

---

## Result Satisfaction (0–5)

-

---

## Human Decision *(Optional)*

-

---

## Review Notes *(Optional)*

-

---

## Future Policy *(Optional)*

Examples

- Always Auto
- Auto with Review
- Human Review
- Human Only

---

## Lessons Learned *(Optional)*

-
