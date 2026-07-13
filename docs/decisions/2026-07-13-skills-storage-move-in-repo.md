# Decision: Skill storage moves from `mekhal/claudeskill` into this repo's own `.claude/skills/`

**Issue:** [#43](https://github.com/mekhal/aidlc-radio-calico/issues/43) (follow-up from Ticket C, [#26](https://github.com/mekhal/aidlc-radio-calico/issues/26))
**Decided by:** @mekhal, 2026-07-13

## Decision

Skills are stored in this repo's own `.claude/skills/<kebab-name>/SKILL.md` — not in the external private repo `mekhal/claudeskill`. `CLAUDE.md`, `README.md`, and `README.th.md` no longer reference `mekhal/claudeskill`; the "Store" and "Runtime" location are now the same place.

The `@claude close` flow is narrowed at the same time: it lists only new-skill candidates **surfaced by the current issue's own work** (not a review of pre-existing skills), and asks the human to add / update (naming which) / skip. Closing an issue never requires a skill change.

## Why

- This repo exists to demonstrate the AI-DLC loop end to end (see `CLAUDE.md`'s "What this repo is"), so a second private repo plus a `SKILLS_REPO_TOKEN` push token wired into `.github/workflows/claude.yml` was unnecessary indirection for a demo.
- Confirmed while closing #26 and re-confirmed twice during #43: the `mekhal/claudeskill` branch (`radio-calico-skill`) was empty, so no migration of existing skill content was needed.
- **Write-guard finding (structural, not configurable):** any file path containing a `.claude/` segment is blocked from agent writes, tested live against this repo's actual `permissions.allow` / `--allowedTools` config — an identical write to a `docs/` path succeeded with no prompt, while the `.claude/skills/...` write was blocked outright. This is a deliberate Claude Code safety boundary (same category as the `.github/workflows/` restriction) and cannot be opened by any permissions setting. The workaround carries over unchanged from the two-repo setup, just collapsed to one repo: the agent drafts `SKILL.md` content outside `.claude/` (inline in the PR/issue body, or a scratch file under `docs/`), and a human creates/commits the file at `.claude/skills/<kebab-name>/SKILL.md`.

## Impact

- `CLAUDE.md`'s Skills section (`Skill capture flow`, `Store vs runtime`, `Adding a skill`, `Using a skill`) and the `@claude close` command-table row are rewritten to drop `mekhal/claudeskill` and document the write-guard workaround plus the narrowed close-flow scope.
- `README.md` / `README.th.md` (canonical) Skill Capture & Reuse section and Repository Structure note are synced to match.
- `.github/workflows/claude.yml`'s `Checkout claudeskill` step and the `SKILLS_REPO_TOKEN` secret dependency become dead weight — removing them is a **human-only** edit (the agent cannot modify `.github/workflows/`), called out explicitly in the issue #43 Code PR.
- Not covered by this decision: `.claude/skills/README.md` still names `mekhal/claudeskill` but sits under the `.claude/` write guard, so the agent cannot fix it directly — flagged as a human fast-follow.
