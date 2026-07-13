/**
 * Ticket C (issue #26): Dark/light theme toggle + footer.
 * AC covered:
 *   - `data-theme` defaults to dark; a toggle switch flips to light and back.
 *   - Footer includes a disclaimer + link to https://www.radio-calico.com/.
 *   - Footer has a Test Report control that opens the on-demand test modal
 *     (issue #41 rewrote this from a link to a button; see
 *     tests/test-report-modal.test.js for the modal's own behavior).
 * These fail today (RED) — app.js has no theme toggle or footer yet.
 * See tests/README.md for how to run this suite.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function getTheme() {
    return document.documentElement.getAttribute("data-theme");
  }

  function findThemeToggle(root) {
    return root.querySelector('[data-testid="theme-toggle"]');
  }

  function findFooter(root) {
    return root.querySelector('[data-testid="footer"]');
  }

  function findFooterSiteLink(root) {
    return root.querySelector('[data-testid="footer-site-link"]');
  }

  function findFooterTestReportLink(root) {
    return root.querySelector('[data-testid="footer-test-report-link"]');
  }

  describe("Theme toggle + footer (issue #26, Ticket C)", () => {
    it("defaults data-theme to dark on load", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      expect(getTheme()).toBe("dark");

      unloadApp(root);
    });

    it("flips data-theme to light when the toggle is activated", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const toggle = findThemeToggle(root);
      expect(toggle).toBeTruthy();

      toggle.click();
      await nextTick();

      expect(getTheme()).toBe("light");

      unloadApp(root);
    });

    it("flips data-theme back to dark when the toggle is activated again", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const toggle = findThemeToggle(root);
      toggle.click();
      await nextTick();
      expect(getTheme()).toBe("light");

      toggle.click();
      await nextTick();
      expect(getTheme()).toBe("dark");

      unloadApp(root);
    });

    it("renders a footer with a non-empty disclaimer and a link to radio-calico.com", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const footer = findFooter(root);
      expect(footer).toBeTruthy();
      expect(footer.tagName).toBe("FOOTER");
      expect((footer.textContent || "").trim().length).toBeGreaterThan(0);

      const siteLink = findFooterSiteLink(root);
      expect(siteLink).toBeTruthy();
      expect(siteLink.getAttribute("href")).toBe("https://www.radio-calico.com/");

      unloadApp(root);
    });

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
