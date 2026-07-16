/**
 * Issue #87 (supersedes issue #79's version of this link): footer link now
 * points directly at the Trivy SARIF report published by CI, instead of
 * GitHub's native Code Scanning Alerts page. Per the human's step-3
 * decision on #87 — "ให้ลิ้งไปเปิดไฟล์ sarif เลยแล้วกัน" — this stays a
 * simple direct link to the raw report file rather than a custom grouped
 * HTML viewer. Same <a target="_blank"> shape as
 * tests/footer-lint-report-link.test.js, just re-pointed and renamed.
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

  describe("Footer security report link (issue #87)", () => {
    it("is a link to the published Trivy SARIF report, labeled 'Security Scan Report', that opens in a new tab", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const link = findFooterSecurityReportLink(root);
      expect(link).toBeTruthy();
      expect(link.tagName).toBe("A");
      expect(link.textContent).toBe("Security Scan Report");
      expect(link.getAttribute("href")).toBe("reports/security/trivy.sarif");
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");

      unloadApp(root);
    });
  });
})();
