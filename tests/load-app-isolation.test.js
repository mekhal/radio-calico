/**
 * Issue #41 (split from #38, Ticket 2 of 2): the Test Report modal runs
 * suites in-DOM, inside the same document as the live app. Those suites use
 * `tests/load-app.js`'s `loadApp()` to mount app.js for each test. AC
 * requires that `loadApp()` must never touch the live app's mounted DOM —
 * today it looks up any element with id="root" document-wide, so if a live
 * app is already mounted at #root (as it is on index.html) and a suite
 * mounted inside the modal calls loadApp(), it would rip out and replace the
 * live app's real #root instead of creating its own isolated fixture root.
 * This fails today (RED) — loadApp() does not scope its lookup to its own
 * fixtures container. See tests/README.md.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  describe("tests/load-app.js isolation from the live app (issue #41)", () => {
    it("never removes or reuses a live #root that lives outside the fixtures container", async () => {
      const liveRoot = document.createElement("div");
      liveRoot.id = "root";
      liveRoot.dataset.testid = "live-app-marker";
      liveRoot.textContent = "live app content";
      document.body.appendChild(liveRoot);

      try {
        const testRoot = await loadApp();
        await nextTick();

        expect(document.body.contains(liveRoot)).toBeTruthy();
        expect(liveRoot.dataset.testid).toBe("live-app-marker");
        expect(liveRoot.textContent).toBe("live app content");
        expect(testRoot).toBeTruthy();
        expect(testRoot === liveRoot).toBeFalsy();

        unloadApp(testRoot);
      } finally {
        if (liveRoot.parentNode) liveRoot.parentNode.removeChild(liveRoot);
      }
    });
  });
})();
