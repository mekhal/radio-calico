(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function findLink(root, testid) {
    return root.querySelector(`[data-testid="${testid}"]`);
  }

  describe("Footer GitHub/LinkedIn links", () => {
    it("GitHub link opens the repo in a new tab, with visible label", async () => {
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
      expect(link.textContent.trim()).toBe("GitHub");

      unloadApp(root);
    });

    it("LinkedIn link opens the profile in a new tab, with visible label", async () => {
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
      expect(link.textContent.trim()).toBe("LinkedIn");

      unloadApp(root);
    });

    it("GitHub and LinkedIn sit in the same group as the other footer links", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const siteLink = findLink(root, "footer-site-link");
      const githubLink = findLink(root, "footer-github-link");
      const linkedinLink = findLink(root, "footer-linkedin-link");
      expect(githubLink.parentElement).toBe(siteLink.parentElement);
      expect(linkedinLink.parentElement).toBe(siteLink.parentElement);

      unloadApp(root);
    });
  });
})();
