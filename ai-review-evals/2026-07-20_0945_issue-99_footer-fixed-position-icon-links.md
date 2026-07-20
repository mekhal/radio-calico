# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#99](https://github.com/mekhal/aidlc-radio-calico/issues/99) |
| PR | [#104](https://github.com/mekhal/aidlc-radio-calico/pull/104) (merged, original Code PR) · [#102](https://github.com/mekhal/aidlc-radio-calico/pull/102) (closed, superseded revision) · [#110](https://github.com/mekhal/aidlc-radio-calico/pull/110) (closed, unmerged) · several later branches with no PR ever opened (see AI Decision #3) |
| Date | 2026-07-20 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Ticket A of the "เริ่มปรับ Layout หลัก" story (#98): a fixed-position footer (`position: fixed;
bottom: 0`, body padding synced to its height) keeping the disclaimer and existing footer items,
plus two new Font Awesome icon-only GitHub/LinkedIn links. Test PR waived by the human at step 3;
went straight to Code PR (step 6). The ticket then went through roughly 15 review/approve rounds
over several days as the AC evolved (icon grouping, new-tab behavior, visible vs. icon-only
labels) and as PRs from earlier rounds were closed without merging.

---

## Original User Request

Original AC1–AC6 (fixed footer, disclaimer unchanged, existing items kept, two new icon-only
GitHub/LinkedIn links, Font Awesome via CDN only, existing tests pass unchanged), followed by a
sequence of review-driven revisions: merge GitHub/LinkedIn into the existing links group + add
tests; make every footer link open in a new tab; add visible "GitHub"/"LinkedIn" text next to
those two icons instead of icon-only.

---

## AI Decision

1. Added an `aria-label` alongside `title` on the icon-only links, unprompted, as a screen-reader
   fallback (`title` alone isn't reliably announced) — a small accessibility addition beyond the
   literal AC wording, later dropped and not consistently reapplied across iterations.
2. Deliberately did not wire a `resize` listener for the footer's body-padding sync, reasoning
   from an existing listener-leak pattern already present elsewhere in the codebase — a scope
   judgment call that was explained in the PR comment but not asked about first.
3. Re-implemented the same already-approved "merge GitHub/LinkedIn into one group + add tests"
   change on four separate branches across 2026-07-17–2026-07-19, because each retry started from
   scratch rather than checking whether a prior branch/PR with the same diff already existed and
   was still valid against `develop`. This repeated cost became the seed for the
   `check-existing-branch-before-reimplementing` skill draft proposed at the 2026-07-20T06:26
   close.
4. For several iterations, manually posted "Create PR" compare links using a `main`-based compare
   (`compare/main...branch`) instead of `develop`-based. This hid a divergent commit and produced
   a PR that looked like it mixed in unrelated changes — traced and fixed at 2026-07-19T03:07,
   becoming the seed for the `pr-links-target-develop` skill draft.
5. When a later review round asked to add visible text labels next to the GitHub/LinkedIn icons,
   correctly recognized this reversed the original icon-only AC4 wording and flagged the exact
   test assertions (`textContent.trim() === ""`) that would need updating, instead of silently
   leaving them stale.

Suggested Keywords:

- unprompted accessibility addition (aria-label)

- judgment call documented before acting (resize handler)

- repeated reimplementation without checking prior branches/PRs

- wrong PR compare-link base branch hid unrelated commits

---

## Decision Type

A mix of introducing additional improvements beyond the literal AC (aria-label, the resize
judgment call) and process/tooling gaps that surfaced during execution and repeatedly slowed
delivery across many review rounds on a single ticket (branch reuse, PR base branch).

Suggested Keywords:

- introducing additional improvements

- process gap surfaced during execution

- changing project conventions (icon-only → icon+text reversal, correctly flagged)

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)

3

---

## Result Satisfaction (0–5)

3

---

## Human Decision *(Optional)*

- Extend `CLAUDE.md`'s "Ask when in doubt" rule to cover over-implementation, not just gate
  approvals (see `docs/decisions/2026-07-20-review-before-over-implementing.md`).
- Promote the `ai-review-evals/` framework from experimental trial to mandatory practice in
  `CLAUDE.md`, synced into both READMEs (see
  `docs/decisions/2026-07-20-ai-review-evaluation-framework-promoted-to-mandatory.md`).

---

## Review Notes *(Optional)*

> AI ไม่ค่อยทำงานตามที่สั่ง ในเรื่องกรอบการทำงานบางส่วนก็โอเคอยู่ แต่ หลายครั้งก็ยัง over
> requirement ไปเยอะ ทำให้งานช้าลง จะดีกว่าถ้า AI ยังไม่เข้าใจ หรือไม่มั่นใจ ควรจะ Review
> กลับมาก่อนที่จะลงมือทำอะไร ตรงไปตรงมา
>
> — @mekhal, 2026-07-20 (quoted verbatim)

---

## Future Policy *(Optional)*

- Human Review (unchanged for now) — revisit once more evaluations accumulate under the
  now-mandatory framework.

---

## Lessons Learned *(Optional)*

- The literal-instruction-vs-judgment-call boundary needs to default toward asking, not acting,
  whenever the addition isn't explicitly requested — now codified in `CLAUDE.md`.
- Repeated reimplementation and wrong PR base links were process gaps, not code-correctness gaps
  — the underlying diffs were consistently correct across all four reimplementation attempts; the
  cost was entirely in delivery process, which is exactly what this framework is meant to surface.
