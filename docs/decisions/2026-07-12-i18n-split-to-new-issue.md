# Decision: i18n (TH/EN) is split out of issue #20 into its own issue

**Issue:** [#20](https://github.com/mekhal/aidlc-radio-calico/issues/20) — "Listen Now" button on hero
**Decided by:** @mekhal, 2026-07-12

## Decision

Issue #20 stays scoped to the Listen Now button + player control (per its approved AC). The language-toggle requirement (Thai/English, default English, strings as JSON under `i18n/`) is tracked as a **separate follow-up issue**, not part of #20.

## Why

Per `CLAUDE.md`'s "missed functionality becomes a NEW issue" rule: i18n is a project-wide capability, not part of #20's original AC, and bundling it in would make #20's Code PR too large to review as one diff.

## Impact

- #20's Test PR / Code PR do not include i18n strings or a language toggle.
- A new issue should be opened for: language toggle (TH/EN switch, default English), `i18n/en.json` and `i18n/th.json`, client-side loading (`fetch`/`$.getJSON`, no i18n library needed).
