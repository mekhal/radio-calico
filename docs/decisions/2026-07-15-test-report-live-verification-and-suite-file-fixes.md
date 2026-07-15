# Decision: Test Report bugs are fixed by verifying on the live deploy, not static review alone; two new skills capture the pattern

**Issue:** [#54](https://github.com/mekhal/aidlc-radio-calico/issues/54) — ตรวจสอบ Test Failed ใน Test Report
**Decided by:** @mekhal, 2026-07-13 → 2026-07-15

## Decision

Issue #54 went through four sequential Test PR → Code PR rounds before the Test Report modal reached 31/31 passed on the live GitHub Pages deploy:

1. **Bug 1 — CDN deps never loaded in the real page.** `index.html` never loaded React/ReactDOM/Babel, so the in-app Test Report modal's `loadApp()` threw `Cannot read properties of undefined (reading 'transform')` on every test. Fixed by `ensureTestReportCdnDeps()` in `app.js`, loading pinned versions (`react@18`, `react-dom@18`, `@babel/standalone@7`) only when not already present.
2. **Bug 2 — test-file list duplicated in two places.** `app.js`'s `TEST_REPORT_SUITE_FILES` and `tests/test-runner.html`'s `<script>` list had drifted out of sync, and `tests/skills-storage-in-repo.test.js` (issue #43) was wired into neither. Fixed by extracting `tests/test-report-suite-files.js` as the single source of truth both entry points load from.
3. **Bug 3 — `initApp()` mounted into the live page's `#root` instead of the harness's fixture root.** `document.getElementById("root")` resolves document-wide, so it always matched `index.html`'s static `#root` (which precedes the fixtures container in document order) instead of the root `tests/load-app.js`'s `loadApp()` had just created — causing every DOM-querying test to see `null` and causing the live page to visibly stack duplicate "Radio Calico" UIs each time the suite ran. Fixed by `window.__APP_ROOT__`: `loadApp()` sets it before injecting `app.js`; `initApp()` prefers it, falling back to the document-wide lookup only for the real page's own initial mount (where `__APP_ROOT__` is never set).
4. **Three bugs in the test files themselves**, found only after bugs 1–3 were fixed and the suite was re-run on the live page:
   - `reloads the page when the Refresh button is clicked` — overriding `window.location.reload` directly isn't honored by real browsers; the assertion read a stale `false` while the real reload fired anyway. Removed per the issue's own AC ("ถ้ามัน Failed จริงๆ หรือยากเกินกว่าจะเทสบนหน้า Browser ก็ลบออกได้เลย").
   - `footer's Test Report control is a button that opens the test modal` — self-referential (opens the same modal it runs inside of), so running it from the auto-run suite found the modal already open and failed. Moved to `tests/footer-test-report-button.test.js`, excluded from `tests/test-report-suite-files.js`, wired only into `tests/test-runner.html` (same treatment as four pre-existing self-referential files).
   - `CLAUDE.md's Adding a skill section documents the write-guard workaround` — case-sensitive `.includes("write-guard")` missed `CLAUDE.md`'s actual capitalized "Write-guard workaround" heading. Fixed with `.toLowerCase()`, matching the pattern already used elsewhere in the same file.

Two new skills were approved to capture the recurring patterns from rounds 3 and 4, split by AI-DLC step so each has a clear trigger:

- **`test-pr-native-api-and-self-ref-checklist`** (step 4 / Test PR) — run the native-API-override check and the self-referential-suite-file check before finalizing test files, and record the resulting seam/exclusion contract in the Test PR description.
- **`code-pr-implements-test-pr-contract`** (step 6 / Code PR) — implement exactly the seam/contract the Test PR recorded, and re-verify the self-referential exclusion still holds, instead of re-deriving a different mechanism from the test diff.

Drafts are in `docs/skill-drafts/` (this PR) for a human to copy into `.claude/skills/<name>/SKILL.md`, per the write-guard workaround below. (Note, 2026-07-15: this staging folder was renamed to `docs/agent-skills/` later the same PR — see the Impact section.)

## Why

- **Static review missed a real bug twice.** Bug 3 (DOM mounting order) was reviewed and believed fixed after tracing the code by hand — twice — because this environment has no headless browser to actually run the suite. It only surfaced once @mekhal tested the real live deploy. Static tracing of DOM-mounting/ordering/event-wiring code in this repo is necessary but not sufficient; a fix in this class isn't "done" until confirmed against the live page or `tests/test-runner.html`.
- **Native browser APIs resist being stubbed by direct assignment.** `window.location.reload = fn` silently no-oped in the real browser instead of throwing or being honored — a failure mode that only a real-browser run (not code review) exposes.
- **The self-referential-suite-file trap can recur.** Four files were already excluded from the auto-run list for this reason (`test-report-modal.test.js`, `load-app-isolation.test.js`, `test-report-cdn-deps.test.js`, `test-report-suite-completeness.test.js`); a fifth (`theme-toggle-footer.test.js`'s footer-modal test) was missed because no explicit check existed at the point a file is added to `tests/test-report-suite-files.js`.
- **Write-guard still applies** (confirmed empirically again in this round, per [[2026-07-13-skills-storage-move-in-repo]]): a direct `Write` to a `.claude/skills/...` path was rejected outright, while an identical write under `docs/` succeeded. The workaround (draft outside `.claude/`, human commits the file) carries over unchanged.

## Impact

- `app.js`, `tests/load-app.js`, and `tests/test-report-suite-files.js` carry the bug 1–3 fixes (PRs #55/#56, #59/#61) and the bug-4 test-file fixes (PR #63), already merged through `develop` → `main`.
- `docs/skill-drafts/test-pr-native-api-and-self-ref-checklist.md` and `docs/skill-drafts/code-pr-implements-test-pr-contract.md` hold the two approved skill drafts, ready to be copied into `.claude/skills/<name>/SKILL.md` by a human. **Update (2026-07-15):** `docs/skill-drafts/` was renamed to `docs/agent-skills/` (files moved as-is) so the staging folder is easier to browse — the two drafts now live at `docs/agent-skills/test-pr-native-api-and-self-ref-checklist.md` and `docs/agent-skills/code-pr-implements-test-pr-contract.md`.
- A third candidate raised at the `@claude close` step, `verify-dom-fix-on-live-deploy` (don't present static-review-only confidence as equivalent to a real-browser check for DOM-mounting/ordering bugs), was **not** approved or drafted as a skill file in this round — it remains an open decision for a human to accept, request changes to, or skip.
