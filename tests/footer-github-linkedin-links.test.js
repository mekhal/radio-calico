/**
 * Issue #99 (Ticket A): footer's GitHub and LinkedIn icon-only links —
 * AC4.1/AC4.2. Same <a target="_blank"> shape as
 * tests/footer-lint-report-link.test.js and
 * tests/footer-security-report-link.test.js, but icon-only (no visible text,
 * `title` carries the accessible label) so both links are covered together
 * here instead of duplicating the icon-only assertions across two files.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function findLink(root, testid) {
    return root.querySelector('[data-testid="' + testid + '"]');
  }

  describe("Footer GitHub and LinkedIn links (issue #99)", () => {
    it("GitHub link is icon-only, titled, and opens the repo in a new tab", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const link = findLink(root, "footer-github-link");
      expect(link).toBeTruthy();
      expect(link.tagName).toBe("A");
      expect(link.getAttribute("href")).toBe("https://github.com/mekhal/aidlc-radio-calico");
      expect(link.getAttribute("title")).toBe("GitHub");
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
      expect(link.getAttribute("rel")).toContain("noreferrer");
      expect(link.textContent.trim()).toBe("");

      unloadApp(root);
    });

    it("LinkedIn link is icon-only, titled, and opens the profile in a new tab", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const link = findLink(root, "footer-linkedin-link");
      expect(link).toBeTruthy();
      expect(link.tagName).toBe("A");
      expect(link.getAttribute("href")).toBe("https://www.linkedin.com/in/mekhalomlao/");
      expect(link.getAttribute("title")).toBe("LinkedIn");
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
      expect(link.getAttribute("rel")).toContain("noreferrer");
      expect(link.textContent.trim()).toBe("");

      unloadApp(root);
    });

    it("GitHub and LinkedIn links sit in the same footer links group as the other links", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const github = findLink(root, "footer-github-link");
      const siteLink = findLink(root, "footer-site-link");
      expect(github.parentElement).toBe(siteLink.parentElement);

      unloadApp(root);
    });
  });
})();
