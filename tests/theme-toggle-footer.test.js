/**
 * Ticket C (issue #26): Dark/light theme toggle + footer.
 * AC covered:
 *   - `data-theme` defaults to dark; a toggle switch flips to light and back.
 *   - Footer includes a disclaimer + link to https://www.radio-calico.com/.
 * These fail today (RED) — app.js has no theme toggle or footer yet.
 * See tests/README.md for how to run this suite.
 *
 * Issue #54: the "footer's Test Report control opens the modal" test moved to
 * tests/footer-test-report-button.test.js — it clicks the real footer button,
 * which opens the on-demand Test Report modal (issue #41) for real. Running
 * it as part of this file's suite, while itself running inside that same
 * modal, produced a false failure (the modal was already open), so it's
 * grouped with the other self-referential test files instead — see
 * tests/test-report-suite-files.js.
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
      expect(siteLink.getAttribute("target")).toBe("_blank");
      expect(siteLink.getAttribute("rel")).toContain("noopener");

      unloadApp(root);
    });
  });
})();
