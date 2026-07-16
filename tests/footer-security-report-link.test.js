/**
 * Issue #67: footer link to the static Trivy filesystem-scan report published
 * by CI. Same pattern as tests/footer-lint-report-link.test.js — a plain
 * <a target="_blank"> to a pre-generated report page, since Trivy only runs
 * in CI.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function findFooterSecurityReportLink(root) {
    return root.querySelector('[data-testid="footer-security-report-link"]');
  }

  describe("Footer security report link (issue #67)", () => {
    it("is a link to the published Trivy report that opens in a new tab", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const link = findFooterSecurityReportLink(root);
      expect(link).toBeTruthy();
      expect(link.tagName).toBe("A");
      expect(link.getAttribute("href")).toBe("reports/security/trivy-report.html");
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");

      unloadApp(root);
    });
  });
})();
