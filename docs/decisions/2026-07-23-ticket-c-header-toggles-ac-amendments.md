# Decision: Ticket C header toggles — AC4/AC6 amendments (sliding-switch redesign, i18n JSON+fetch, icon choices)

**Issue:** [#101](https://github.com/mekhal/aidlc-radio-calico/issues/101)
**Decided by:** @mekhal, 2026-07-22 through 2026-07-23

## Decision

Ticket C's originally-approved plan (inline `TRANSLATIONS` dict in `app.js`, bordered-text-box theme toggle, position-only AC4) was revised through several review rounds into:

1. **AC6 amendment — i18n as JSON + `fetch()`, not inline in `app.js`.** Translation strings live in `i18n/en.json` / `i18n/th.json`, loaded via `fetch()` on init and gated behind `window.__i18nReady`. Confirmed safe only because the human stated the app always runs over http(s) (GitHub Pages / a web server) and never needs to work opened via `file://` — `tests/README.md`'s documented `file://` CORS failure mode for local `fetch()` does not apply here. DOM still builds with hardcoded English defaults first (so first paint and pre-existing tests are unaffected before the fetch resolves), then `applyLanguage()` re-renders once translations load.
2. **AC4 amendment — both toggles redesigned as pill/thumb sliding switches**, replacing the original bordered-text-box style. `data-testid`, `role="switch"`, and keyboard behavior (click + Enter/Space) are unchanged; only markup/CSS changed.
3. **Language toggle thumb — flag icon, not text.** First built with Unicode regional-indicator flag emoji (🇬🇧/🇹🇭); these render as literal "GB"/"TH" text on platforms without a color-emoji font for flag sequences (chiefly Windows/Linux). Replaced with inline SVG flag icons (no new CDN dependency) once this was reported. The flag SVG is sized to fill the thumb and cropped to a full circle via `preserveAspectRatio="xMidYMid slice"` + `overflow: hidden` on the thumb, rather than letterboxed/squashed to fit.
4. **Theme toggle thumb — moon/sun icon**, mirroring the language toggle's icon-thumb pattern (🌙 dark / ☀️ light), with track color from the Style Guide palette (Charcoal for dark-default, Calico Orange for light-active) instead of a placeholder blue. Header bar color itself was explicitly deferred, not part of this ticket.
5. **Theme switch thumb position — shows the target of the next click, not the current state** (a deliberate reversal of the initial current-state-reflecting design): at the Dark default, the thumb sits on the Light side (bolded "Dark" label shows the active theme). This was accepted as the desired UX even though it means the switch's thumb position no longer visually mirrors its own `aria-checked` value one-to-one. Implementing this correctly required fixing a real, pre-existing bug in `toggleTheme()`: `aria-checked` was computed from the pre-toggle state (`!isDark`) instead of the post-toggle state, which only looked correct at initial load and would have inverted after the first click.

## Why

Each amendment was confirmed explicitly by the human after the agent flagged the literal-AC conflict and asked before implementing (per `CLAUDE.md`'s "ask before over-implementing" rule) — see the 2026-07-22T06:00–08:10 review turns on issue #101. The `file://`-safety question for AC6 in particular was raised and answered before implementation, avoiding a silent regression for any non-http(s) deployment path.

## Impact

- `app.js` / `styles.css`: see PRs [#138](https://github.com/mekhal/aidlc-radio-calico/pull/138), [#140](https://github.com/mekhal/aidlc-radio-calico/pull/140)/[#141](https://github.com/mekhal/aidlc-radio-calico/pull/141), [#143](https://github.com/mekhal/aidlc-radio-calico/pull/143), [#145](https://github.com/mekhal/aidlc-radio-calico/pull/145) (all merged into `develop`, then released to `main` via #146).
- `i18n/en.json`, `i18n/th.json` (new): translation dictionary, superseding the AC6-as-originally-written "in `app.js`" location.
- `tests/language-toggle.test.js`: covers the toggle behavior, thumb icon/flag rendering, and the `aria-checked` fix.
- The original issue #101 body's AC4/AC6 text is now superseded by this doc for anyone reading the issue after the fact — the literal AC wording was not edited retroactively.
