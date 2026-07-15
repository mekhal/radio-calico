/**
 * Ticket C (issue #26): footer's Test Report control opens the on-demand
 * test modal (issue #41 rewrote this from a link to a button; see
 * tests/test-report-modal.test.js for the modal's own behavior).
 *
 * Issue #54: split out of tests/theme-toggle-footer.test.js. Clicking the
 * real footer button opens the real Test Report modal — self-referential,
 * like tests/test-report-modal.test.js and tests/load-app-isolation.test.js,
 * since running this file's own test from inside that same modal would find
 * the modal already open and fail. So it's excluded from
 * tests/test-report-suite-files.js and wired only into
 * tests/test-runner.html — see the comment there.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function findFooterTestReportLink(root) {
    return root.querySelector('[data-testid="footer-test-report-link"]');
  }

  describe("Theme toggle + footer (issue #26, Ticket C)", () => {
    it("footer's Test Report control is a button that opens the test modal", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const testReportButton = findFooterTestReportLink(root);
      expect(testReportButton).toBeTruthy();
      expect(testReportButton.tagName).toBe("BUTTON");
      expect(testReportButton.hasAttribute("href")).toBeFalsy();

      expect(document.querySelector('[data-testid="test-report-modal"]')).toBeFalsy();

      testReportButton.click();
      await nextTick();

      expect(document.querySelector('[data-testid="test-report-modal"]')).toBeTruthy();

      const closeButton = document.querySelector('[data-testid="test-report-modal-close"]');
      if (closeButton) closeButton.click();

      unloadApp(root);
    });
  });
})();
