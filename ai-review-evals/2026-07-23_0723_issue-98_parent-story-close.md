# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#98](https://github.com/mekhal/aidlc-radio-calico/issues/98) (parent story) — sub-issues [#99](https://github.com/mekhal/aidlc-radio-calico/issues/99), [#100](https://github.com/mekhal/aidlc-radio-calico/issues/100), [#101](https://github.com/mekhal/aidlc-radio-calico/issues/101) |
| PR | [#102](https://github.com/mekhal/aidlc-radio-calico/pull/102) (Ticket A, merged) · [#133](https://github.com/mekhal/aidlc-radio-calico/pull/133) (Ticket B, merged) · [#138](https://github.com/mekhal/aidlc-radio-calico/pull/138)/[#140](https://github.com/mekhal/aidlc-radio-calico/pull/140)/[#141](https://github.com/mekhal/aidlc-radio-calico/pull/141)/[#143](https://github.com/mekhal/aidlc-radio-calico/pull/143)/[#145](https://github.com/mekhal/aidlc-radio-calico/pull/145) (Ticket C, merged) |
| Date | 2026-07-23 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Parent story "เริ่มปรับ Layout หลัก" (#98): apply the RadioCalico style guide, add a fixed footer
with icon links, rebuild the page on a Bootstrap 4 Cover layout, and add an EN/TH language toggle
alongside the theme toggle in a header bar. At step 2, this was split into three sequenced native
sub-issues (Ticket A → #99, Ticket B → #100, Ticket C → #101, the last one added by the human
during the 5-questions discovery). This eval covers decisions made directly on the **parent
thread** (#98) itself — sub-issue-specific decisions already have their own eval entries
([#99](../ai-review-evals/2026-07-20_0945_issue-99_footer-fixed-position-icon-links.md),
[#101](../ai-review-evals/2026-07-23_0426_issue-101_header-language-theme-toggles.md)) and are not
duplicated here.

---

## Original User Request

Style-guide layout, a fixed footer with a GitHub/LinkedIn icon link group, and a Bootstrap 4
"Cover" example layout — all under one issue. Later, mid-discovery, the human added a fourth
requirement (EN/TH language toggle + theme toggle in the header bar) and approved splitting the
whole story into three sequenced sub-issues instead of one large ticket.

---

## AI Decision

1. At step 2, proposed splitting the single issue into reviewable sub-tickets per `CLAUDE.md`'s
   "split large work into multiple tickets" rule, before any code was written — the human
   confirmed and added a fourth ticket (i18n) that hadn't been asked for yet, which was folded in
   as Ticket C rather than expanded in-place.
2. When asked (2026-07-16) to merge two already-created branches and delete one, correctly
   identified this as a git merge/delete operation outside agent capability and explained the
   workaround (comment on the open PR, not the issue, so follow-ups land on the same branch)
   instead of attempting a workaround that could have discarded work — captured as
   `docs/decisions/2026-07-16-pr-followups-on-pr-not-issue.md` directly from this thread.
3. On a later `@claude review` → `@claude approved` round (2026-07-22) asking for theme-switch
   sun/moon icons and style-guide-derived colors, went straight to a Code PR without re-opening a
   step-3/4 gate, treating it as a small, already-scoped refinement of Ticket C's existing switch
   rather than a new AC. While implementing, found and fixed a real pre-existing `aria-checked`
   bug in `toggleTheme()` — the same fix is also recorded in the #101 eval (the two threads
   converged on the same code path).
4. That 2026-07-22 branch (`claude/issue-98-20260722-0751`) and an earlier one
   (`claude/issue-98-20260720-1423`, Ticket B) were each left as an unopened "Create PR" compare
   link rather than an actual `gh pr create` call. Neither caused lost work — Ticket B's code
   reached `develop` via a separately-opened PR (#133), and the theme-switch fix reached `develop`
   via Ticket C's own later PRs — but both are instances of the issue #135 pattern (link posted,
   PR never opened), predating that mitigation's rollout.
5. On this close turn, found that `ai-review-evals/2026-07-21_0932_issue-100_global-layout-bootstrap-cover.md`
   (Ticket B's own eval, confirmed drafted and pushed per the #100 thread) never reached `develop`
   — its branch (`claude/issue-100-20260721-1516`) no longer exists on the remote and no PR was
   ever opened for it. This is the exact issue #135 failure mode, but it predates PR #136's fix and
   is now effectively unrecoverable (the branch is gone) — flagged in the close comment for the
   record rather than silently left undiscovered.

Suggested Keywords:

- correctly declined an out-of-scope git operation (merge/delete branches)

- unopened "Create PR" link, code recovered via a different merged PR

- lost documentation artifact (issue-100 eval never reached `develop`, branch deleted)

---

## Decision Type

Coordination/orchestration decisions at the parent-story level (ticket splitting, capability
boundary explanation) plus two recurrences of the issue #135 process gap (PR never opened from a
posted compare link) that happened to self-resolve for code but not for one documentation file.

Suggested Keywords:

- process gap surfaced during execution (issue #135 recurrence, predates its own fix)

- making architectural assumptions (treating a follow-up as in-scope of an existing ticket, not a
  new AC)

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)

4

---

## Result Satisfaction (0–5)

3

---

## Human Decision *(Optional)*

- Scores given directly in the `@claude close` comment rather than left blank: Instruction
  Fidelity 4, Result Satisfaction 3.
- Verbatim feedback: "พอ ชอบดึง branch มาทำผิดบ่อย" (roughly: "that's enough — [it] likes to pull
  the wrong branch often").

---

## Review Notes *(Optional)*

> กว่าจะจบงานแรก ไม่่ง่ายเลย ขัดเกลามาตั้งเยอะ ขอให้คะแนน AI ทำงาน 4 แล้วกันและก็ผลลัพท์ 3 ละกัน พอ
> ชอบดึง branch มาทำผิดบ่อย
>
> (Roughly: "Getting through this first piece of work wasn't easy — a lot of back-and-forth
> refinement. Giving the AI's work a 4 and the result a 3, that's enough. [It] likes to pull the
> wrong branch often.")
>
> — @mekhal, 2026-07-23

The recurring "wrong branch" feedback matches an already-diagnosed and already-mitigated pattern —
`docs/decisions/2026-07-17-sync-to-develop-before-work-mitigation.md` (issue #106 checkout bug)
and `docs/decisions/2026-07-23-verify-branch-ancestry-via-merge-base-not-diff-or-compare-link.md`
(false-positive/negative branch-ancestry checks, surfaced on #101). No new decision doc is added
for it here since both root causes are already recorded; this entry exists to confirm the human's
close-time feedback lines up with a known, tracked issue rather than a new one.

---

## Future Policy *(Optional)*

- Human Review (unchanged) — this story alone produced two Hard Rules (`CLAUDE.md`) and five
  decision docs from repeated process friction; revisit once the now-several-story evaluation
  history shows the checkout/branch-ancestry mitigations actually reducing recurrence.

---

## Lessons Learned *(Optional)*

- A "Create PR" compare link is not equivalent to an opened PR — across this story, two links were
  never converted to real PRs, and while the code survived both times (merged through a different
  PR), one documentation-only artifact (the #100 eval file) did not, because its branch was later
  deleted with nothing else referencing its content. Prefer `gh pr create` immediately over posting
  a link, especially for documentation-only branches with no code redundancy to fall back on.
- Splitting a story into sequenced sub-issues at step 2, before any code exists, kept each Code PR
  reviewable across three tickets and ~30+ review rounds — validates the "split large work" rule
  as applied here, distinct from the friction that came from process/tooling gaps rather than the
  ticket-splitting decision itself.
