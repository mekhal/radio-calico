/**
 * Issue #79 (supersedes issue #67's version of this link): footer link now
 * points at GitHub's native Code Scanning Alerts page for this repo instead
 * of the static Trivy HTML report, per the human's review comment on #79 —
 * "ปุ่ม security ให้ลิ้งไปที่ .../security/code-scanning ส่วนลิ้งตั้งชื่อว่า
 * Code Security Audit". Same <a target="_blank"> shape as
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

  describe("Footer security report link (issue #79)", () => {
    it("is a link to the repo's Code Scanning Alerts page, labeled 'Code Security Audit', that opens in a new tab", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const link = findFooterSecurityReportLink(root);
      expect(link).toBeTruthy();
      expect(link.tagName).toBe("A");
      expect(link.textContent).toBe("Code Security Audit");
      expect(link.getAttribute("href")).toBe(
        "https://github.com/mekhal/aidlc-radio-calico/security/code-scanning",
      );
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");

      unloadApp(root);
    });
  });
})();
