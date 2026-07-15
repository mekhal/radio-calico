<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/test-pr-native-api-and-self-ref-checklist/SKILL.md
Locked in issue #54: https://github.com/mekhal/aidlc-radio-calico/issues/54
-->
<!-- BEGIN SKILL.md -->
---
name: test-pr-native-api-and-self-ref-checklist
description: Use at AI-DLC step 4 in this repo (writing failing tests / opening a Test PR) — run before finalizing test files, to catch native-API-override flakiness and self-referential auto-run entries, and to record the implementation contract the Code PR (step 6) must follow.
---

Run these two checks against every new/changed test file before opening the Test PR:

1. **No native API override.** If a test needs to intercept a native browser API with side effects (`window.location.reload`, navigation, `window.open`, etc.), do not assign over the native property directly — real browsers may silently ignore it (issue #54: `window.location.reload = fn` did not stop the real reload from firing, so the assertion read a stale `false`). Instead:
   - Design a small application-level seam the test can stub deterministically, e.g. `(window.__hookName__ || (() => nativeCall()))()` in the app code, and write the exact seam name/shape into the Test PR description — that description is the spec step 6 implements against, not a re-derivation from the diff.
   - If a seam isn't worth the production-code change, don't write the assertion at all — delete/skip it rather than ship one that's flaky against a real native API (this repo's own AC already allows removing tests that can't reliably run in a browser).

2. **Self-referential test audit.** If the file is a candidate for an in-app auto-run suite list triggered by a UI control (this repo's Test Report modal, `tests/test-report-suite-files.js`), check whether any test in it clicks/opens that same control as part of its own assertions. If so:
   - Exclude the file from the auto-run list.
   - Wire it only into the manual full-suite entry point (`tests/test-runner.html`).
   - State the exclusion and the reason explicitly in the Test PR description, so it isn't silently re-added to the auto-run list later.

Record the outcome of both checks (pass / n-a / seam contract defined) in the Test PR body — this is the explicit, reviewable contract the Code PR must implement against.
<!-- END SKILL.md -->
