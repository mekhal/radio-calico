/**
 * Single source of truth for which tests/*.test.js files make up the "real"
 * suite — shared by the footer's on-demand Test Report modal (app.js, issue
 * #41) and tests/test-runner.html, so adding a new test file only means
 * editing this list once instead of two hand-maintained copies (issue #54).
 *
 * Deliberately excludes files that open the Test Report modal themselves
 * (tests/test-report-modal.test.js, tests/load-app-isolation.test.js,
 * tests/test-report-cdn-deps.test.js, tests/test-report-suite-completeness.test.js,
 * tests/footer-test-report-button.test.js)
 * — including them here would recurse, since their own tests open this very
 * modal. Those five are wired directly into tests/test-runner.html instead.
 */
(function (global) {
  global.TEST_REPORT_SUITE_FILES = [
    "harness-serialization.test.js",
    "hero-listen-now-control.test.js",
    "status-indicators-error-recovery.test.js",
    "theme-toggle-footer.test.js",
    "skills-storage-in-repo.test.js",
    "app-mount-scoping.test.js",
  ];
})(window);
