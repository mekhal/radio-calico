# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#101](https://github.com/mekhal/aidlc-radio-calico/issues/101) |
| PR | [#138](https://github.com/mekhal/aidlc-radio-calico/pull/138) (merged) · [#140](https://github.com/mekhal/aidlc-radio-calico/pull/140) (merged) · [#141](https://github.com/mekhal/aidlc-radio-calico/pull/141) (merged) · [#143](https://github.com/mekhal/aidlc-radio-calico/pull/143) (merged) · [#145](https://github.com/mekhal/aidlc-radio-calico/pull/145) (merged) · four earlier branches with no PR ever opened, all superseded (`claude/issue-101-20260721-1532`, `-0623`, `-0810`, `-0818`) |
| Date | 2026-07-23 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Ticket C of the "เริ่มปรับ Layout หลัก" story (#98): add a two-state EN/TH language toggle to the
header bar, relocate the existing theme toggle into it, with translations persisted to
`localStorage`. Test PR waived by the human at step 3; went straight to Code PR (step 6). The
ticket went through roughly a dozen review/approve rounds as the visual design and i18n
architecture were revised beyond the original AC wording, and repeatedly hit the issue #106
checkout-lands-on-`main` bug.

---

## Original User Request

Original AC1–AC6 (header toggle pair, EN default, full-string translation with `localStorage`
persistence, theme toggle position-only move, `role="switch"` controls, inline JS dictionary — no
i18n library/bundler), followed by review-driven revisions: move translations to `i18n/*.json` via
`fetch()`; redesign both toggles as pill/thumb sliding switches with flag and moon/sun thumb icons
from Style Guide colors; theme switch thumb should show the *next* state rather than the current
one; fix flag rendering (emoji → SVG) and flag shape (square → cropped circle).

---

## AI Decision

1. Correctly flagged, before implementing, that moving i18n to `i18n/*.json` + `fetch()`
   contradicted AC6's literal "in `app.js`" wording, and that `fetch()`-ing local JSON is a
   documented `file://` CORS risk in this repo (`tests/README.md`) — asked whether the app always
   runs over http(s) before proceeding, rather than assuming. Confirmed safe once the human
   answered, then implemented.
2. Correctly flagged the AC4 conflict when a full visual redesign (bordered box → sliding switch)
   was requested, since AC4 as approved said "and dark/light CSS ... only its position moves" —
   asked for explicit sign-off rather than silently reinterpreting the AC, per
   `docs/decisions/2026-07-20-review-before-over-implementing.md`.
3. While implementing the theme switch's "shows next click's target" position (a human-confirmed
   design reversal), found and fixed a real pre-existing bug in `toggleTheme()` where
   `aria-checked` was computed from the pre-toggle state instead of the post-toggle state — folded
   the fix into the same change rather than filing it separately, reasoning that the new
   CSS-position mapping would have been visibly wrong without it. Not asked about first, but
   explained in the same PR comment.
4. Repeatedly (5 times across this thread: 2026-07-21T15:32, 2026-07-22T06:23/07:15/08:10/08:17,
   2026-07-22T15:03, 2026-07-23T03:12) hit the issue #106 "checked out at `main`'s tip instead of
   `develop`'s" bug on `@claude approved` turns, each time self-healing via the documented
   mitigation (reset to `origin/develop` since no remote history existed yet) rather than needing
   human intervention — consistent with the mitigation working as designed, at the cost of visible
   repetition in the thread.
5. Three times, the human reported a branch as "not rebased from `develop`" using a
   `compare/main...branch` link's ahead/behind counts. On investigation, one report
   (2026-07-22T07:09) was a genuine issue #106 instance; two (2026-07-22T08:17, 2026-07-23T03:19)
   were false positives caused by `main`/`develop` divergence unrelated to the branch in question —
   diagnosed correctly each time by checking `git merge-base` against `develop` directly instead of
   trusting the diff-only check or the compare-link summary. This became the seed for
   `docs/decisions/2026-07-23-verify-branch-ancestry-via-merge-base-not-diff-or-compare-link.md`
   and a proposed skill (see close comment).
6. First posted five separate "Create PR" compare links across this thread without ever running
   `gh pr create`, leaving four branches stranded with no PR (flagged repeatedly per the issue #135
   mitigation) before switching to opening PRs directly with `gh pr create --base develop` from
   2026-07-22T08:31 onward.

Suggested Keywords:

- judgment call documented before acting (aria-checked bug fix folded into a design change)

- AC conflict correctly flagged before implementing (AC4 visual redesign, AC6 i18n location)

- repeated checkout-bug self-healing without human intervention

- compare-link false positive required actual commit-graph inspection to resolve

- delayed adoption of `gh pr create` despite existing issue #135 mitigation

---

## Decision Type

A mix of correctly-flagged AC amendments (deferring to the human before over-implementing), a
judgment call bundled into an approved change (bug fix folded into the theme-switch redesign), and
a process/tooling gap that recurred across many rounds on a single ticket (checkout bug self-heal
cadence, and diagnosing "wrong branch" reports that were sometimes right and sometimes an artifact
of `main`/`develop` divergence).

Suggested Keywords:

- AC amendment correctly gated on human sign-off

- judgment call documented before acting

- process gap surfaced during execution (branch ancestry verification method)

- delayed adoption of an existing mitigation (`gh pr create` vs. posting links)

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)



---

## Result Satisfaction (0–5)



---

## Human Decision *(Optional)*



---

## Review Notes *(Optional)*



---

## Future Policy *(Optional)*



---

## Lessons Learned *(Optional)*

- Diagnosing "is this branch based on `develop`" needs `git merge-base` against `origin/develop`
  checked directly — neither an empty `diff --stat` nor a GitHub compare-to-`main` link's
  ahead/behind count reliably answers that question, and both misled at least one turn on this
  issue.
- Once the human confirms an AC amendment (design reversal, dictionary relocation), later
  discovering a related pre-existing bug in the same code path is reasonable to fix inline with a
  documented reason, rather than filing it separately, when leaving it unfixed would make the
  just-approved change visibly broken.
