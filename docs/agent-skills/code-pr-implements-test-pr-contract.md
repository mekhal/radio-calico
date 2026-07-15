<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/code-pr-implements-test-pr-contract/SKILL.md
Locked in issue #54: https://github.com/mekhal/aidlc-radio-calico/issues/54
-->
<!-- BEGIN SKILL.md -->
---
name: code-pr-implements-test-pr-contract
description: Use at AI-DLC step 6 in this repo (writing code for an already-approved Test PR) — implement exactly the seam/contract the Test PR recorded (per test-pr-native-api-and-self-ref-checklist), instead of re-deriving a different mechanism from the test diff.
---

When writing the Code PR against a merged Test PR:

1. Read the Test PR description for any recorded contract — most commonly a seam name/shape from the "no native API override" check (e.g. `window.__hookName__`). Implement exactly that seam; don't invent a different mechanism the tests weren't written against, and don't touch the real native API path the tests intentionally avoided stubbing.
2. Re-check that the self-referential-test-audit result from the Test PR still holds after your change: any test file that opens/clicks the same UI control it's testing must stay out of the in-app auto-run list (`tests/test-report-suite-files.js`) and remain wired only into `tests/test-runner.html`.
3. If your implementation needs a contract the Test PR didn't define, don't silently diverge from it — the Test PR is the human-approved spec for this step; flag the gap back to the human before merging.
<!-- END SKILL.md -->
