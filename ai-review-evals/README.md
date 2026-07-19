# AI Review Evaluations

## Purpose

This framework evaluates **AI decisions, not AI models or code quality**. Each file records the
judgment calls an agent made while completing a task — where it went beyond the literal
instruction — so a human can review that decision later with full context.

It exists to support an evidence-based move from **Human Review Everything** to
**Human Review Risk**: once enough evaluations accumulate, the recorded Risk Level and
Instruction Fidelity scores can show which kinds of AI decisions are safe to trust with lighter
review, and which still need a human to look at every time.

## Status: experimental trial

This is a trial practice, not yet a mandatory step in `CLAUDE.md`'s `@claude close` flow. Once
this feature is merged, the agent follows it manually for issues in the trial. If it proves
valuable after enough evaluation data accumulates, a follow-up issue can promote it to a hard
`CLAUDE.md` rule and/or a `.claude/skills/` skill.

## What gets recorded

Only **meaningful** AI decisions — judgment calls with consequences beyond the literal
instruction (scope choices, refactors, added features/accessibility changes, convention changes,
architectural assumptions). Routine tool calls (reading a file, running a lint command, a
mechanical one-to-one rename) are not logged.

## One file per `@claude close` event

Each `@claude close` on an issue creates one **new** file — it is a log of evaluations, not a
rolling issue summary. If an issue is reviewed further and closed again later, that produces a
second, separate file. Files are grouped by issue (not per-PR); the `PR` metadata field can list
more than one PR when an issue spawns several.

### Filename convention

```
YYYY-MM-DD_HHMM_issue-<N>_<short-title>.md
```

Example

```
2026-07-19_2140_issue-99_footer-links.md
```

### Auto-filled vs. human-filled fields

The agent fills in `Metadata` (Issue, PR, Date, Agent, Model), `Task`, `Original User Request`,
`AI Decision`, and `Decision Type` at creation time, using [`TEMPLATE.md`](TEMPLATE.md).
`Risk Level` defaults to `Medium`.

`Instruction Fidelity` and `Result Satisfaction` are always left blank for a human to score later
— never self-scored by the agent, so the framework doesn't grade its own homework.
`Human Decision`, `Review Notes`, `Future Policy`, and `Lessons Learned` are also left for later
human input.

## Decision taxonomy

The keyword lists under `AI Decision` and `Decision Type` are intentionally lightweight and
extensible, not a fixed enum — **consistency is preferred over completeness**. Prefer an existing
keyword when one reasonably fits; add a new one only when nothing in the list applies, and add it
here so future evaluations reuse it too.

Starter keywords for `Decision Type` (seeded from recurring patterns seen in AI-assisted work):

- introducing additional improvements
- refactoring unrelated code
- adding accessibility changes
- changing project conventions
- making architectural assumptions

`AI Decision` keywords are freeform tags describing the specific decision and are not seeded with
a starter list.
