# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is a **process demo**, not an application. The deliverable is the *workflow* — proving a human + the Claude GitHub agent can produce production-grade work end-to-end on GitHub. Do not treat requests as "build the Radio Calico app locally"; treat them as steps in the AI-DLC loop. There is no product source code yet — `src/` and `tests/` are created only when the first loop begins.

The full process is defined in `README.md` (Thai, canonical) and `README.en.md` (English). Read the README before acting on any issue.

## The AI-DLC loop (how work must proceed)

Work is driven by GitHub issues tagged `@claude`, through a 7-step loop with a **human gate at every odd step**. When operating as the `@claude` agent, follow this order strictly and stop at each gate — never skip ahead:

1. Human opens an issue (Story / Improvement / Task).
2. AI spawns a **sub-agent** to gather context using the 5 questions (What's known / What if / Now what / So what / What's unsaid), then posts a **plan + explicit Acceptance Criteria**. Do not write code or tests here.
3. Human reviews/approves the plan and specifies the tests. **If you have any doubt, ask the human before they approve** — do not assume.
4. AI writes **failing tests for the AC only** → opens a **Test PR**. Tests target AC, nothing more.
5. Human approves the Test PR.
6. AI writes code per the plan (reuse-first) → opens a separate **Code PR**.
7. Human reviews and merges into `develop`.

## The @claude gate (how humans drive each turn)

A human drives every turn by posting a command comment. **End every answer you post in an issue or PR by appending the gate block below** (as a comment), so the human can copy the command they want, paste it as a new comment, add any detail, and submit it themselves. The **only exception**: do NOT append the gate block after handling `@claude close`.

The gate block to append verbatim (each command is its own code block so GitHub shows a copy button):

`````markdown
---
### 👉 ขั้นถัดไป — คัดลอกคำสั่งที่ต้องการ วางเป็นคอมเมนต์ใหม่ (เติมรายละเอียดต่อได้)

**✅ อนุมัติ — เดินหน้า step ถัดไปของ loop**
```
@claude approved
```
**🔍 รีวิว — มีคำถาม/ขอปรับ (ยังไม่อนุมัติ ไม่เขียนโค้ด)**
```
@claude review
```
**🏁 ปิดงาน — สรุปการตัดสินใจ + เสนอ skill ชิ้นถัดไป**
```
@claude close
```
---
`````

### What each command means

| Command | What you do | Append gate block after? |
|---|---|---|
| `@claude approved` | Advance to the next step of the AI-DLC loop (plan → Test PR at step 4, or Test PR → Code PR at step 6). **Never merge or approve on your own.** | Yes |
| `@claude review` | Answer the human's questions / adjust the plan. **Discuss only — do not write code and do not open a PR.** Then append the gate block again. | Yes |
| `@claude close` | Used **only to summarize the issue for skill creation**: record the decisions made in this work under `docs/decisions/`, then list any new-skill candidates surfaced by this issue's own work and ask the human whether to add/update/skip (see "Adding a skill"). **Do NOT close the issue yourself — the human closes the issue manually.** | No |
| Any other trigger (opening a task / first question) | Follow the AI-DLC loop: at step 2, spawn a sub-agent to ask the 5 questions, then post **plan + Acceptance Criteria only** — do not write code or tests. | Yes |

## Hard rules (do not violate)

- **Never merge or approve on your own.** Every merge/approval is a human action.
- **Test PR and Code PR are separate PRs** (steps 4 and 6). Never combine them.
- **Split large work into multiple tickets** in steps 4 and 6 so a human can actually review each PR. Reviewability is a requirement, not a nicety.
- **Reuse-first**, and cover reusable pieces with unit tests.
- **Missed functionality becomes a NEW issue** — never expand scope inside the current loop. Keep the focus on closing the current issue.
- On step-7 rework requests, **loop back to step 6** (fix the code) and open a new Code PR; do not reopen the whole loop.
- `develop` → `main` is a **prod release and is human-only**. Never open or merge a PR into `main`.
- **Always explicitly set the PR base branch to `develop`** when opening a Test PR or Code PR (e.g. `gh pr create --base develop`) — never rely on the default base branch, which may be `main`. See `docs/decisions/2026-07-12-pr-base-branch-must-be-develop.md`.

## Operating rules (imperative)

These are the README's principles restated as directives you must act on. `README.md` (English) and `README.th.md` (Thai) remain the human-facing explanation; this section is the operating copy. (Thai is canonical.)

### Core principles

- **Human decides, always.** You propose; the human decides at every gate. Never decide on the human's behalf.
- **TDD.** Write a failing test first, then the code that makes it pass.
- **Test the AC only.** Write tests that cover the Acceptance Criteria and nothing more. If tests would exceed the AC, stop and raise it — do not add them.
- **Reuse-first.** Write reusable code and cover the reusable pieces with unit tests.
- **Review-sized PRs.** Before opening a PR, if the diff is too large to review, split it into multiple tickets first.
- **Capture the decision.** Every human decision is recorded so the agent improves next round (see "Skills").
- **Production-grade.** Every Code PR must pass the Definition of Done below before a human merges.
- **Close the current issue.** Missed functionality becomes a NEW issue — never drag it into the current loop.

### The 5 questions (step 2 context discovery)

Before producing the plan, the sub-agent gathers context and asks the human using this frame to sharpen the AC:

| # | Question | Seeks |
|---|---|---|
| 2.1 | **What's known?** | Facts/constraints already known for certain |
| 2.2 | **What if?** | Scenarios / edge cases that could arise |
| 2.3 | **Now what?** | The next step that should be taken |
| 2.4 | **So what?** | The impact/importance of each option |
| 2.5 | **What's unsaid?** | What hasn't been said / hidden assumptions |

### Definition of Done (every Code PR at step 6)

A Code PR is not done until all of these hold:

- **Security:** passes security scan (dependency, secret, SAST); no secrets in the repo; least-privilege permissions.
- **Quality:** all AC tests pass (TDD); lint/format clean; code is reusable and covered by tests.
- **Reviewability:** PR is a reasonable size; split into tickets when needed; description links to the AC.
- **Traceability:** the PR references the related issue and AC.

### Branching

- **feature branch** — where you open the Test PR / Code PR for each loop.
- **`develop`** — the destination of each completed loop; **a human merges into it**, never you.
- **`main`** — merging `develop` → `main` is a **production release and is human-only**. Never open or merge a PR into `main`.

### Ask when in doubt

Before a human approves at any gate, if you have any doubt, **ask the human to clarify first** — do not assume.

## Tech stack

Decided under issue #20 (see `docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md`):

- **App code:** HTML + vanilla JavaScript + jQuery. No build step, no bundler. If any React remains, it is limited to bare `ReactDOM`/`React.createElement` with no extra npm packages and no JSX/Babel transform.
- **Dependencies:** CDN `<script>` references only — the app never runs `npm install`.
- **Data:** `localStorage` is the "database"; there is no backend/server-side store.
- **Tests:** hand-written vanilla JavaScript (no Jest/npm test framework) under `tests/`. If a test needs "the database," mock `localStorage` — only as far as the AC under test requires. Tests run only when `tests/test-runner.html` is opened directly in a browser (never on app load, never via an `npm test` script); `index.html` links to that report page. See `docs/decisions/2026-07-12-testing-framework-vanilla-runner.md` and `tests/README.md`.

## Skills

Skills turn human decisions into reusable capability so the agent improves each round.

### Skill capture flow

1. **Capture** — every time the human decides (chooses an approach, sets a rule, redirects a plan), record it under `docs/decisions/`.
2. **Distill** — recurring/valuable decisions are written up as a skill.
3. **Store** — skills live in **this repo's own `.claude/skills/`** — the source of truth. There is no external skills repo.
4. **Reuse** — the agent invokes these skills in later loops to work better and stay consistent with prior human decisions.

### Store vs runtime

- **Store:** this repo's `.claude/skills/` folder holds the skill files — store and runtime are the same location, so there is no separate checkout/sync step.

### Skill format

One skill = a folder `.claude/skills/<kebab-name>/SKILL.md` with frontmatter:

```markdown
---
name: <kebab-name>
description: <when to use it / what it does — one line>
---

<skill body>
```

### Adding a skill

When you handle `@claude close`:

1. List **only the new-skill candidates surfaced by this issue's own work** — do not review or re-propose changes to pre-existing skills already in `.claude/skills/`; whether to touch those is the human's independent call and never gates closing the issue.
2. For each candidate, draft its `SKILL.md` content (in the format above) and ask the human to decide: add it, update a named existing skill, or skip — the issue can be closed with zero skill changes.

**Write-guard workaround (structural, not a permissions gap):** any file path containing a `.claude/` segment is blocked from agent writes — confirmed empirically (issue #26, issue #43) against this repo's actual `permissions.allow`/`--allowedTools` config, so it cannot be opened by adding an allowlist entry. This is a deliberate Claude Code safety boundary (same category as the `.github/workflows/` restriction), not something to fix later. The workaround: the agent drafts `SKILL.md` content **outside** `.claude/` (inline in the PR/issue body, or a scratch file under `docs/`), and a **human** creates/commits the file at `.claude/skills/<kebab-name>/SKILL.md`.

### Using a skill

Skills are stored in this repo's own `.claude/skills/` (source of truth). Before starting any piece of work, check the skills available on the runner and invoke the relevant skill first. Also check `docs/skill-drafts/` for skill candidates awaiting a human's promotion to `.claude/skills/` (see the write-guard workaround above) — read and apply their guidance too, since a draft not yet promoted is still a captured human decision.

## Source of truth & keeping docs in sync

**`CLAUDE.md` is the operating source of truth** for the agent's practical rules — read and act on it. `README.md` (English) and `README.th.md` (Thai) are the human-facing explanation and mirror each other section-for-section; **Thai is canonical**. When you change an operating rule in `CLAUDE.md`, sync the change back into both README files so the human docs stay consistent.

## Commands

Scaffold the planned folder structure (`.github/`, `docs/`, `specs/`, `src/`, `tests/`) — run from the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/scaffold.ps1
```

It is idempotent and never overwrites existing files. There is no build, lint, or test tooling yet; add it (with commands documented here) when the first product code lands in step 6.

## Assets

Brand and product references are in `RadioCalicoStyle/`: `RadioCalico_Style_Guide.txt` (colors, typography, components), `stream_URL.txt` (HLS stream), and logo/layout PNGs. Use the style guide's palette and type scale for any Radio Calico UI work.
