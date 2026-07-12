# Decision: Tech stack is HTML + vanilla JavaScript + jQuery, CDN-only, no npm

**Issue:** [#20](https://github.com/mekhal/aidlc-radio-calico/issues/20) — "Listen Now" button on hero
**Decided by:** @mekhal, 2026-07-12

## Decision

Radio Calico's product code is built with:

- **HTML + vanilla JavaScript + jQuery.** No build step, no bundler.
- If any React remains anywhere in the app, it is limited to bare `ReactDOM`/`React.createElement` calls with **no additional npm packages installed** and no JSX/Babel transform.
- **Dependencies are CDN `<script>` references only.** The app never runs `npm install`.
- **`localStorage` is the "database."** There is no backend/server-side data store.

## Why

The human decided this while reviewing issue #20's Test PR plan, to keep the app runnable by opening `index.html` directly — no install step, no framework migration risk, consistent with this repo being a process demo rather than a production app.

## Impact

- The existing `app.js`/`index.html` (React + JSX via `babel-standalone`) will be rewritten to vanilla JS/jQuery as part of issue #20's Code PR (step 6) — implementing the Listen Now button directly in the target stack rather than in React first, to avoid throwaway work.
- Any future product code follows this same stack unless a new decision changes it.
