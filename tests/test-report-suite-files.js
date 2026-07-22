/**
 * Single source of truth for which tests/*.test.js files make up the footer's
 * on-demand Test Report modal (app.js, issue #41) — shared with
 * tests/test-runner.html so adding a new test file only means editing this
 * list once instead of two hand-maintained copies (issue #54).
 *
 * Scoped to tests that exercise app.js's own HTML/DOM interface functions
 * (issue #67, AC2) — not the full repo suite. Two categories are deliberately
 * excluded, both wired directly into tests/test-runner.html instead so they
 * still run somewhere:
 *
 * - Self-referential files that assume they're running from
 *   tests/test-runner.html — either because they open the Test Report modal
 *   themselves (tests/test-report-modal.test.js,
 *   tests/load-app-isolation.test.js, tests/test-report-cdn-deps.test.js,
 *   tests/footer-test-report-button.test.js), which would recurse if injected
 *   into the modal's own suite, or because they fetch test-runner.html by a
 *   path relative to it (tests/test-report-suite-completeness.test.js), which
 *   would 404 if injected from index.html instead.
 * - Files that don't test app.js's interface functions at all:
 *   tests/harness-serialization.test.js (tests tests/assert.js, the harness
 *   itself) and tests/skills-storage-in-repo.test.js (doc-content assertions
 *   against CLAUDE.md/README.md, no app/DOM behavior).
 */
(function (global) {
  global.TEST_REPORT_SUITE_FILES = [
    "hero-listen-now-control.test.js",
    "status-indicators-error-recovery.test.js",
    "theme-toggle-footer.test.js",
    "language-toggle.test.js",
    "app-mount-scoping.test.js",
    "footer-lint-report-link.test.js",
    "footer-security-report-link.test.js",
    "footer-github-linkedin-links.test.js",
  ];
})(window);
