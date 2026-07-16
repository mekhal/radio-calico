# Decision: SARIF-only Trivy fix, direct file link instead of a custom HTML viewer, Test PR skipped

**Issue:** [#87](https://github.com/mekhal/aidlc-radio-calico/issues/87) — Fix Trivy CI: switch scan output to SARIF + build grouped HTML report viewer and repoint app.js link
**Decided by:** @mekhal, 2026-07-16

## Decision

The issue body asked for three things: (1) fix the Trivy CI failure by
switching to SARIF output, (2) build a self-contained grouped HTML viewer
for the SARIF findings, (3) repoint the `app.js` footer link at that viewer.
At step 2 the agent flagged that (3) as originally scoped would silently
reverse issue #79's decision (footer link points at GitHub's native Code
Scanning Alerts page instead of a static report) and asked five clarifying
questions, proposing to split the work into a CI-fix ticket and a
viewer-ticket gated on the human's answers.

The human's answer simplified scope instead of answering each question:

> "ฉันคิดว่ามันยุ่งยากไป สำหรับการ demo แล้วมันควรจะเป็นอะไรที่ ง่ายๆ
> ถ้าอย่างงั้น ให้ลิ้งไปเปิดไฟล์ sarif เลยแล้วกัน ถ้าไม่ได้ ก็ให้ทำยังไงก็ได้
> ให้เปิดไฟล์เพื่อเช็คได้ก็พอ ข้ามไป step Code PR เลย"
> ("I think it's too complicated for a demo — it should be simple. Just
> link to open the SARIF file directly. If that's not possible, do whatever
> it takes so the file can be opened to check. Skip straight to the Code PR
> step.")

This resolves the plan as:

1. **No grouped HTML viewer is built.** Task 2 from the issue body is
   dropped — out of scope for this round, superseding that part of the
   original issue text.
2. **`app.js`'s footer security link is repointed a second time** (issue #79
   pointed it at GitHub's Code Scanning Alerts page; this issue repoints it
   again) — now directly at the published `reports/security/trivy.sarif`
   file, the same relative-link pattern already used for the lint report
   link (`reports/lint/megalinter-report.html`). Opening a `.sarif` file
   directly shows raw JSON in the browser rather than a formatted report,
   which is an accepted tradeoff per the human's explicit "if that doesn't
   work, whatever it takes to check the file is enough" fallback.
3. **Test PR (step 4) is waived**, same as issues #67 and #79 — the human's
   "ข้ามไป step Code PR เลย" is an explicit instruction to skip straight to
   step 6. The existing `tests/footer-security-report-link.test.js` (added
   under #79) is still updated in this Code PR to match the new href/label,
   since it is pre-existing coverage that would otherwise start failing —
   this is not a new AC test, so it doesn't require its own Test PR.
4. **CI fix**: `docs/ci-drafts/trivy.yml` drops the still-broken
   `format: template` / `contrib/html.tpl` step entirely (see
   `docs/ci-drafts/README.md`'s "fix 3/3" note — that earlier fix was never
   actually copied into the live workflow, and would not have worked even if
   it had been). Only the `format: sarif` step remains, staged to
   `reports/security/trivy.sarif` and still uploaded to GitHub Code Scanning
   via `github/codeql-action/upload-sarif` (kept from issue #79's draft —
   harmless, still useful for GitHub's native security tab even though
   `app.js` no longer links there).
5. **Write-guard applies again**: the agent cannot write under
   `.github/workflows/`, so `docs/ci-drafts/trivy.yml` is updated and a human
   must copy it into `.github/workflows/trivy.yml` per
   `docs/ci-drafts/README.md`'s install steps — same pattern as issues #67
   and #79.

## Why

- **Human decides, always** (`CLAUDE.md`): the human explicitly traded the
  richer grouped-viewer requirement for simplicity, and explicitly waived
  the Test PR step — both honored as given rather than re-litigated.
- **Don't silently drop coverage**: repointing the footer link without
  updating its existing test would leave the suite red; fixing that stays
  inside "make the Code PR correct," not "add new AC tests."
- **Traceability**: `docs/ci-drafts/README.md`'s fix log is corrected so it
  no longer claims the `contrib/html.tpl` relative-path fix was "confirmed
  live" — it wasn't; that inaccurate claim is very likely why issue #87's
  failure was a surprise in the first place.

## Impact

- `docs/ci-drafts/trivy.yml`: single `format: sarif` scan step (no more
  `format: template`), staged to `reports/security/trivy.sarif` — **not yet
  live**; a human must copy this into `.github/workflows/trivy.yml`.
- `app.js`: `securityReportLink` now points at `reports/security/trivy.sarif`
  with label "Security Scan Report" (was: GitHub Code Scanning Alerts page,
  labeled "Code Security Audit").
- `tests/footer-security-report-link.test.js`: updated to assert the new
  href/label.
- `docs/ci-drafts/README.md`: paths and fix-log corrected to match.
- No grouped SARIF HTML viewer exists — out of scope for this round. If ever
  wanted later, per `CLAUDE.md` that would be a new issue, not scope added
  back into #87.
