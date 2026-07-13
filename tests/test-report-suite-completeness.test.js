/**
 * Issue #54: app.js's TEST_REPORT_SUITE_FILES (the footer modal's injected
 * suite) and tests/test-runner.html's own <script> list have drifted apart —
 * they're two hand-maintained copies of "which test files are the real
 * suite" instead of one. tests/skills-storage-in-repo.test.js (issue #43)
 * was never added to either, so it has never actually run. This test covers
 * the footer-modal side of that gap: the modal's injected suite must fetch
 * tests/skills-storage-in-repo.test.js like every other real test file.
 *
 * Fails today (RED) — app.js's TEST_REPORT_SUITE_FILES only lists 4 files
 * and does not include it. See tests/README.md.
 *
 * Note: tests/skills-storage-in-repo.test.js and this file are not
 * self-referential (unlike tests/test-report-modal.test.js and
 * tests/load-app-isolation.test.js, which must stay excluded from
 * TEST_REPORT_SUITE_FILES — including them would recurse, since their own
 * tests open this very modal). This file itself opens the modal, so for the
 * same reason it must not be added to TEST_REPORT_SUITE_FILES either — only
 * to tests/test-runner.html's script list.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function waitFor(predicate, { timeout = 10000, interval = 50 } = {}) {
    const start = Date.now();
    for (;;) {
      const value = predicate();
      if (value) return value;
      if (Date.now() - start >= timeout) {
        throw new Error("waitFor: timed out waiting for condition");
      }
      await wait(interval);
    }
  }

  function findFooterTestReportButton(root) {
    return root.querySelector('[data-testid="footer-test-report-link"]');
  }

  function spyOnFetch() {
    const calls = [];
    const original = window.fetch;
    window.fetch = function (input) {
      const url = typeof input === "string" ? input : (input && input.url) || String(input);
      calls.push(url);
      return original.apply(this, arguments);
    };
    return {
      matching(pattern) {
        return calls.filter((url) => pattern.test(url));
      },
      restore() {
        window.fetch = original;
      },
    };
  }

  describe("Test Report modal suite completeness (issue #54)", () => {
    it("fetches tests/skills-storage-in-repo.test.js as part of the injected suite", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const fetchSpy = spyOnFetch();
      try {
        const button = findFooterTestReportButton(root);
        button.click();

        await waitFor(() => fetchSpy.matching(/skills-storage-in-repo\.test\.js/).length > 0);

        const closeButton = document.querySelector('[data-testid="test-report-modal-close"]');
        if (closeButton) closeButton.click();
      } finally {
        fetchSpy.restore();
      }

      unloadApp(root);
    });
  });
})();
