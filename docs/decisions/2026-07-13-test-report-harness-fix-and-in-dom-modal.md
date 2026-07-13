# Decision: Split issue #38 into two sub-issues; test modal uses in-DOM injection, not an iframe

**Issue:** [#38](https://github.com/mekhal/aidlc-radio-calico/issues/38) — Test Report page: on-demand modal + fix harness race condition
**Decided by:** @mekhal, 2026-07-13

## Decision

Split #38 into two sequential native GitHub sub-issues, following the precedent in [[2026-07-13-split-large-story-into-sub-issue-tickets]]:

- **Ticket 1** — harness race-condition fix (`tests/assert.js` serializes `it()`).
- **Ticket 2** — on-demand Test Report modal (depends on Ticket 1).

For Ticket 2, answering the plan's open questions:

1. **Isolation strategy:** in-DOM injection, not the iframe recommended in the step-2 plan. The modal's test run injects the harness/fixture DOM directly into the host page's DOM (in a dedicated off-screen container), not inside an `<iframe src="...">`. This still needs to avoid colliding with the live app's real `#root` — the modal's injected fixture container must use a different id/namespace than the live mount.
2. **`tests/test-runner.html`:** kept as-is (fallback/CI entry point), not deleted, once the modal exists.
3. **Modal styling:** styled per `RadioCalicoStyle/RadioCalico_Style_Guide.txt`, not left unstyled.
4. **Escape-key/focus handling:** in scope for this issue's AC, not deferred.
5. **Re-opening the modal:** re-run the suites every time it opens (no caching of the last result).

## Why

Keeps each ticket's Test PR/Code PR small enough to review (CLAUDE.md's "review-sized PRs" rule) and sequences the modal work after the harness is deterministic, so Ticket 2 isn't demoing flaky results. In-DOM injection was chosen over an iframe to keep the fixture DOM directly inspectable/stylable from the same document (no cross-frame styling/messaging), at the cost of needing explicit id-namespacing discipline to avoid clobbering the live app's `#root`.

## Impact

- Ticket 2's implementation must namespace the injected fixture root (e.g. a distinct id, not `#root`) so `tests/load-app.js`'s `loadApp()` never touches the live app's mounted DOM.
