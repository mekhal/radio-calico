<div align="center">
  <img src="RadioCalicoStyle/RadioCalicoLogoTM.png" alt="Radio Calico" width="120" />

  # Radio Calico · AI-DLC Demo

  **English** · [ไทย](README.th.md)

  **A demonstration of an AI-Driven Development Life Cycle, driven 100% through GitHub**

  Testing whether the Claude GitHub agent can deliver production-grade software end-to-end with a human making the decision at every step.

  `Human-in-the-loop` · `TDD` · `Skill capture & reuse` · `Production-grade`
</div>

---

## 1. What is this?

This repo is **not an application** it is a **process demo**.

The goal is not to run the Radio Calico app locally. It is to prove that the **workflow** between a human and the Claude GitHub agent can produce production-grade work entirely on GitHub from taking the task, planning, writing tests, writing code, all the way to review and merge.

> Everything starts by opening a **GitHub issue** and tagging `@claude`.
> The agent then works through the **AI-DLC Loop** below, pausing for a human decision at every gate.

> **Note on language:** This repository uses **Thai as the primary language** for all process documentation, decision logs, and examples. This is intentional the precision required for testing Claude Agent commands on GitHub demands the use of Thai. If you're interested in following along, you can use **Google Translate** to translate the entire page for your reference.

---

## 2. Core Principles

| Principle | Meaning |
|---|---|
| **Human decides, always** | A human decides at every step AI proposes, it does not decide. |
| **TDD** | Write a failing test first, then write the code to make it pass. |
| **Test AC only** | Tests target the Acceptance Criteria only never so many that a human can't review them. |
| **Reuse-first** | Write reusable code, and test the reusable pieces. |
| **Review-sized PRs** | If the code/tests get too big, split into tickets a human can actually review. |
| **Capture the decision** | Every human decision is captured as a *skill* so the agent gets better next round. |
| **Production-grade** | Every PR must pass security and quality gates. |
| **Close the current issue** | Missed functionality becomes a new issue never dragged into the current loop. |

---

## 3. Setup (wiring `@claude` into the repo)

Before the first loop, connect the Claude GitHub agent to this repo:

1. **Install the Claude GitHub App** for this repo (via Claude Code or [github.com/apps/claude](https://github.com/apps/claude)).
2. **Add the secret** `ANTHROPIC_API_KEY` under *Settings → Secrets and variables → Actions*.
3. **Add a workflow** `.github/workflows/claude.yml` that triggers when `@claude` is mentioned in an issue or PR comment. Example skeleton:

```yaml
name: Claude
on:
  issue_comment:
    types: [created]
  issues:
    types: [opened, assigned]
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude') || contains(github.event.issue.body, '@claude')
    runs-on: ubuntu-latest
    permissions:          # least-privilege only what is needed
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

> Adjust to the latest official Claude Code GitHub Action docs. Once wired up, typing `@claude` in an issue wakes the agent to start the loop.

---

## 4. AI-DLC Loop (the core)

<div align="center">
  <img src="aidlc-loop.png" alt="AI-DLC Loop 7 steps" width="900" />
</div>

### Step by step

| # | Actor | What happens | Human gate | Deliverable |
|---|---|---|---|---|
| **1** | Human | Open an issue (type: **Story / Improvement / Task**), describe the requirement, and tag `@claude`. | | Issue |
| **2** | AI | **Before planning**, the agent spawns a **sub-agent** to gather context using the **5 questions** (below) to frame the AC well, then produces a **plan + Acceptance Criteria** that are explicit per plan item. | | Plan + AC (comment) |
| **3** | Human | Review the plan and AC → if not OK, comment with the fixes / if OK, comment to approve **and specify the unit tests and integration tests wanted** *if the AI has any doubts, it must ask the human to clarify first, before the human approves.* | Approve plan | Approved plan |
| **4** | AI | Review the plan again, then write **failing tests for the AC only** as approved → open a **Test PR** for review. | | Test PR |
| **5** | Human | Review and **approve the Test PR**. Once merged, the AI starts step 6. | Approve Test PR | Merged tests |
| **6** | AI | Write the code per the plan, **reuse-first** → open a **Code PR**. | | Code PR |
| **7** | Human | Review the code → may request changes / missed functionality becomes a **new issue** / when everything is OK, the human **merges into `develop`** = loop closed. | Merge | Code on `develop` |

> **Splitting tickets:** In steps 4 and 6, if the generated code/tests are too large, Claude must **split them into multiple tickets** as appropriate so a human can review them.

> **Rework:** The diagram is drawn as a cycle to convey the overall flow in practice, if the human reviews the code (step 7) and finds something to fix, the AI **loops back to step 6** (fix the code) and opens a new Code PR until it passes. **Missed functionality** becomes a **new issue** and is not fixed inside the current loop, keeping the focus on closing the current issue.

### The 5 questions in step 2 (Sub-agent context discovery)

Before creating the plan, the sub-agent gathers information and asks the human using this frame to sharpen the AC:

| # | Question | Seeks |
|---|---|---|
| 2.1 | **What's known?** | Facts/constraints already known for certain |
| 2.2 | **What if?** | Scenarios / edge cases that could arise |
| 2.3 | **Now what?** | The next step that should be taken |
| 2.4 | **So what?** | The impact/importance of each option |
| 2.5 | **What's unsaid?** | What hasn't been said / hidden assumptions |

---

## 5. Quickstart: one loop, end to end

**Step 1 Human opens an issue**

```
Title: [Story] "Listen Now" button on the hero
Type: Story

As a visitor, I want a "Listen Now" button on the hero
so I can start the stream immediately.
- Use Forest Green (#1F4E23) per the style guide
- Clicking starts the HLS stream

@claude
```

**Step 2 AI responds (abridged)**

```
From the 5W frame:
- What's known: style guide + stream URL already exist
- What's unsaid: do we need pause? mobile support?

Plan:
1. Add a ListenNow button (reuse the existing Button component)
2. Wire an HLS player to the stream URL

Acceptance Criteria:
- AC1: button renders in #1F4E23 on the hero
- AC2: clicking starts the stream within 2 seconds

Question before I plan further: does this round need a pause button?
```

**Step 3 Human approves**

```
Answer: no pause this round plan looks good, approved

Unit test: button renders in the correct color + calls play() on click
Integration test: HLS player loads the stream URL successfully
```

The AI then does **step 4** (Test PR) → Human **approves (step 5)** → AI **step 6** (Code PR) → Human **reviews + merges (step 7)**, closing the loop.

---

## 6. Rules of Engagement

- **A human decides every time** no step lets the AI merge or approve on its own.
- **AI asks when in doubt** before a human approves at any gate, if the AI has doubts it must ask the human to clarify first.
- **PRs must be reviewable** if too big, split into tickets (applies to both the test step and the code step).
- **Tests stick to the AC** no tests beyond the agreed AC scope.
- **Reuse-first** build reusable code and write unit tests covering the reusable pieces.
- **Missed work → new issue** don't drag newly found work into the current loop; focus on closing the current issue.
- **Separate PR types** the Test PR (step 4) and Code PR (step 6) are distinct PRs so review happens in layers.

---

## 7. Skill Capture & Reuse

The heart of making the agent "keep getting better" is turning **human decisions** into **reusable skills**.

<div align="center">
  <img src="skill-capture-reuse.png" alt="Skill Capture & Reuse continuous improvement loop" width="900" />
</div>

- **Capture:** Every time a human decides (choosing an approach, setting a rule, redirecting a plan), it is recorded in the decision log.
- **Distill:** Recurring/valuable decisions are written up as skills.
- **Store:** Skills live in a **separate private skills repo** → [`mekhal/claudeskill`](https://github.com/mekhal/claudeskill) *(private)*.
- **Reuse:** The agent invokes these skills in later loops, working better and staying consistent with the human's prior decisions.

> **Why a separate repo?** This demo repo is public to showcase the process, while skills are team-specific assets, so they live in a private repo and are pulled in when the agent works.

---

## 8. Repository Structure

```
aidlc-radiocalico/
├─ README.md                     ← this file (English, default)
├─ README.th.md                  ← Thai version: describes the AI-DLC process
├─ .github/
│  ├─ ISSUE_TEMPLATE/            ← issue templates: story / improvement / task
│  ├─ pull_request_template.md   ← pre-review PR checklist
│  └─ workflows/                 ← claude.yml, CI, security scan, quality gates
├─ docs/
│  ├─ ai-dlc-loop.md             ← the loop in depth
│  └─ decisions/                 ← decision log (records of human decisions)
├─ specs/                        ← plan + AC created by the AI per issue
├─ src/                          ← Radio Calico product code
├─ tests/                        ← tests (written before code, TDD)
└─ RadioCalicoStyle/             ← brand assets + style guide (already present)
```

> **Skills** do not live in this repo they are stored separately in [`mekhal/claudeskill`](https://github.com/mekhal/claudeskill) *(private)*.

### Branching

| Branch | Meaning |
|---|---|
| feature branch | Where the AI opens the Test PR / Code PR for each loop — always with an explicit `--base develop` (never rely on the default base branch, which may be `main`) |
| `develop` | The destination of each completed loop (merged by a human) |
| `main` | Production merging `develop` → `main` is a **prod release** and must be done by a **human only** |

---

## 9. The Radio Calico Project

The sample product used for the demo is **Radio Calico** a high-quality, ad-free lossless audio radio/streaming service (24-bit / 48 kHz).

- **Brand & UI Style Guide:** [`RadioCalicoStyle/RadioCalico_Style_Guide.txt`](RadioCalicoStyle/RadioCalico_Style_Guide.txt)
- **Logo & Layout:** [`RadioCalicoStyle/`](RadioCalicoStyle/)
- **Stream URL:** see [`RadioCalicoStyle/stream_URL.txt`](RadioCalicoStyle/stream_URL.txt)

**Color palette:** Mint `#D8F2D5` · Forest Green `#1F4E23` · Teal `#38A29D` · Calico Orange `#EFA63C` · Charcoal `#231F20`

### Tech stack & testing

Decided under issue #20 (see `docs/decisions/`):

- **App code:** HTML + vanilla JavaScript + jQuery, CDN `<script>` dependencies only — no build step, no `npm install`. If any React remains, it's limited to bare `ReactDOM`/`React.createElement`, no extra packages.
- **Data:** `localStorage` acts as the "database"; no backend store.
- **Tests:** hand-written vanilla JavaScript under `tests/`, run only by opening `tests/test-runner.html` in a browser (never on app load, never via `npm test`); mock `localStorage` where a test needs "the database." `index.html` links to the test report page.

---

## 10. Production-grade Standards

Every Code PR (step 6) must pass these gates before a human merges:

| Category | Criteria |
|---|---|
| **Security** | Passes security scan (dependency, secret, SAST) · no secrets in the repo · least-privilege |
| **Quality** | All AC tests pass (TDD) · lint/format clean · code is reusable and covered by tests |
| **Reviewability** | Reasonable PR size · split into tickets when needed · description linked to the AC |
| **Traceability** | Every PR references the related issue and AC |

---

## 11. References & Acknowledgements

- The ideas and process in this project were inspired by the Udemy course **"Claude Code: Building Faster with AI, from Prototype to Prod"** thanks to **Frank Kane**.
- Thanks to **Kunaruk Osatapirat** (speaker) for the talk **"AI-driven architecture: Designing distributed systems at scale"** at **AWS Summit Bangkok 2026**.

---

<div align="center">
  <sub>Built to demonstrate the end-to-end capabilities of the Claude GitHub agent · Human-in-the-loop at every step</sub>
</div>
