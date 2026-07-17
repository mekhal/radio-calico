# Decision: Test PR is only required when a ticket touches `index.html` or a script it loads

**Issue:** [#106](https://github.com/mekhal/aidlc-radio-calico/issues/106)
**Decided by:** @mekhal, 2026-07-17

## Decision

A ticket only needs a Test PR (step 4 of the AI-DLC loop) if its changes touch `index.html` or a script file that `index.html` loads. For any other ticket (workflow/process docs, `CLAUDE.md` rules, decision records, etc.), the Test PR is waived by default and the loop goes straight from an approved plan (step 3) to the Code PR (step 6).

This generalizes the existing case-by-case waiver clause in `CLAUDE.md` step 3 (waive when a step is "too complex to test in isolation, genuinely hard to test, or needs a build/scaffold") into a standing, surface-based rule: UI/script changes get a Test PR, everything else doesn't need one asked about each time.

## Why

- Per [[2026-07-12-testing-framework-vanilla-runner]], this repo's hand-written vanilla test harness (`tests/test-runner.html`) exercises DOM/browser behavior of `index.html` and the scripts it loads. It has no mechanism to "test" non-UI artifacts like Markdown rules or workflow YAML — there is nothing for the runner to load or assert against.
- Issue #106 itself only changes `CLAUDE.md` (no `index.html`/script surface), which is what prompted @mekhal to state this as a general rule rather than a one-off waiver.

## Impact

- `CLAUDE.md`'s Tech stack "Tests" section gains a "Test PR scope" bullet stating this rule.
- `README.md` / `README.th.md` "Tech stack & testing" sections synced with the same rule.
- Issue #106's own Code PR proceeds without a Test PR, per this rule.
