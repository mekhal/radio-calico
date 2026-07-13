# Decision: Test-Report-modal loop — no local test execution, in-Test-PR conflict fix, and a bounded reentrancy guard

**Issue:** [#41](../../issues/41) — Test Report: on-demand modal via in-DOM test injection
**Decided by:** @mekhal, 2026-07-13

## Decision

Follow-on decisions made while executing #41 (Ticket 2 of [[2026-07-13-test-report-harness-fix-and-in-dom-modal]]), on top of that split decision:

1. **No local build/execution to verify RED/GREEN.** Per [[2026-07-12-tech-stack-vanilla-js-jquery]] (CDN-only, no `npm install`, tests run only by opening a file in a browser), reaching for `node`/`python3` to run the suite locally during Test PR verification was overreach, not a missing tool to work around. Verification of `tests/*.test.js` changes is by static inspection (grep the assertions' target `data-testid`s/selectors against the current DOM) plus asking the human to open `tests/test-runner.html` / `index.html` in a real browser to confirm RED then GREEN.
2. **A test conflict discovered by this AC gets fixed inside this loop's Test PR, not deferred.** `tests/hero-listen-now-control.test.js` asserted exactly one `<button>` on the page; making the footer control a `<button>` (this AC) breaks that count. Since the break is a direct, mechanical consequence of *this* AC (not new scope), the fix — scoping `findListenButton`/the count assertion to `[data-testid="listen-button"]` — was folded into this issue's own PRs rather than filed as a separate follow-up issue.
3. **Speculative test-authoring notes get dropped, not shipped as comments.** A "should probably use an isolated harness instance" note was speculative guidance for the Code PR step, unbacked by any assertion. Per CLAUDE.md's "test the AC only," it was removed — only the reasoning that traces to an actual AC line or assertion belongs in the test file.
4. **In-DOM injection of the suite requires a bounded reentrancy guard.** The modal's injected suite includes `tests/theme-toggle-footer.test.js`, whose own test clicks the same footer "Test Report" button to assert modal-open behavior — without a guard this recurses (click → inject suite → suite's own test clicks the button → inject again → ...). The Code PR added a document-wide reentrancy guard bounded to one extra nested open/close, cleared synchronously on modal close so "re-run every time it opens" doesn't race the prior run's in-flight fetch.
5. **This issue closes with no new skill.** Explicitly requested at the `@claude close` gate — the human judged nothing here was recurring/valuable enough to distill into a `.claude/skills/` entry this round.

## Why

Keeps step 4/6 verification honest about what this repo's no-build constraint actually allows, keeps the Test PR mergeable without leaving a known-broken GREEN test behind, and keeps test files scoped strictly to the AC per CLAUDE.md's TDD principle. The reentrancy guard is a correctness requirement surfaced only once in-DOM injection was implemented (the iframe alternative rejected in [[2026-07-13-test-report-harness-fix-and-in-dom-modal]] would not have had this self-inclusion hazard, since an iframe's suite wouldn't run in the same document as the trigger button).

## Impact

- Future Test PRs in this repo should default to static inspection + human browser verification, not attempt to shell out to `node`/`python3`.
- Future ACs that add/change DOM structure should check for count/selector assertions elsewhere in `tests/` that assume the old structure, and fix them in the same Test PR when the break is a direct consequence of the AC.
- Any future suite that can inject itself into a page reachable by its own tests (in-DOM injection, not iframe) needs the same reentrancy-guard pattern `app.js`'s modal now uses.
