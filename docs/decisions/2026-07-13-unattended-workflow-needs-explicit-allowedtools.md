# Decision: `claude.yml` must explicitly allow `gh`/`git` network commands via `--allowedTools`

**Issue:** [#20](https://github.com/mekhal/aidlc-radio-calico/issues/20) — "Listen Now" button on hero
**Decided by:** @mekhal, 2026-07-12

## Decision

The `anthropics/claude-code-action@v1` step in `.github/workflows/claude.yml` must pass `claude_args: --allowedTools "Bash(git:*),Bash(gh issue:*),Bash(gh pr:*),Bash(gh api:*)"` (or equivalent). A repo-committed `.claude/settings.json` alone does not grant tool permissions in unattended runs — there is no human present to approve an interactive prompt, so any `gh`/network `git` command silently fails with "this command requires approval" until the workflow itself allow-lists it.

## Why

Multiple runs on this issue tried to create sub-issues and open PRs via `gh`/`git fetch` and were blocked, even after `.claude/settings.json` was updated on `develop` to list those tools as allowed. The fix only took effect once `claude_args: --allowedTools ...` was added directly to the workflow step. `.claude/` is also treated as a sensitive path the agent cannot self-edit, so this can only be fixed by a human editing the workflow file.

## Impact

- Any future repo that wants the `@claude` agent to run `gh`/`git` network commands unattended needs this same `claude_args` line in its workflow, not just a `.claude/settings.json` change.
- Worth distilling into a reusable skill/checklist for new AI-DLC repos (see proposal in issue #20's close-out comment).
