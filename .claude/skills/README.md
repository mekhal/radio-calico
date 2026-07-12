# Vendored skills

Skills in this folder are auto-discovered by Claude Code (including the `@claude`
GitHub agent) when the repo is checked out. Each skill is a folder containing a
`SKILL.md` with `name` / `description` frontmatter.

## What's here

Baseline skills vendored from **[superpowers](https://github.com/obra/superpowers)**
by Jesse Vincent (MIT — see [`LICENSE`](LICENSE)), pinned from plugin version
`6.1.1`:

| Skill | Use in the AI-DLC loop |
|---|---|
| `brainstorming` | Turn an issue into a design + AC before writing anything (step 2) |
| `writing-plans` | Turn an approved spec into a bite-sized implementation plan |
| `test-driven-development` | Write failing tests first, then code (steps 4 & 6) |
| `requesting-code-review` | Verify work before opening / merging a PR |

## Scope notes

- These four skills reference three other superpowers skills that are **not**
  vendored here: `executing-plans`, `subagent-driven-development`,
  `using-git-worktrees`. They are execution-orchestration skills; the references
  are harmless if the skills are absent (they simply won't load). Add them the
  same way (copy the folder from superpowers) if you want that behavior.
- **Team skills are NOT stored here.** Skills distilled from human decisions live
  in the private repo [`mekhal/claudeskill`](https://github.com/mekhal/claudeskill)
  and are pulled into the runner separately (this public repo would expose them).

## Updating

These are a vendored snapshot, not a live dependency. To update, re-copy the skill
folders from a newer superpowers release and keep `LICENSE` in sync.
