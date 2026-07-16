/**
 * Issue #67: footer link to the static Mega-Linter report published by CI.
 * Unlike the Test Report button (issue #41), Mega-Linter only runs in CI, so
 * this is a plain <a target="_blank"> to a pre-generated report page instead
 * of an on-demand modal.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function findFooterLintReportLink(root) {
    return root.querySelector('[data-testid="footer-lint-report-link"]');
  }

  describe("Footer lint report link (issue #67)", () => {
    it("is a link to the published Mega-Linter report that opens in a new tab", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const link = findFooterLintReportLink(root);
      expect(link).toBeTruthy();
      expect(link.tagName).toBe("A");
      expect(link.getAttribute("href")).toBe("reports/lint/megalinter-report.html");
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");

      unloadApp(root);
    });
  });
})();
