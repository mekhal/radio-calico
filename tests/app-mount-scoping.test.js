/**
 * Issue #54 (bug 3, found after bugs 1/2 were fixed and verified live): app.js's
 * initApp() mounts into `document.getElementById("root")`, which returns the
 * *first* element with id="root" in document order — document-wide, not scoped
 * to the fixtures container tests/load-app.js's loadApp() just created. On
 * index.html, the static `<div id="root">` in the page markup comes before the
 * Test Report modal's fixtures container (appended later, on click), so every
 * suite test that calls loadApp() from inside the modal ends up mounting the
 * app into the *live* page's root instead of its own isolated fixture root —
 * the returned root stays empty, so assertions against it see nothing there
 * (`Expected null to be truthy`) and the live page ends up with duplicate
 * "Radio Calico" UI stacked into the real #root on every run.
 *
 * Planned fix (approved, not yet implemented — this is the step 4 Test PR):
 * loadApp() sets window.__APP_ROOT__ to the fixtures root it creates before
 * injecting app.js, and initApp() prefers window.__APP_ROOT__ over a
 * document-wide getElementById lookup. Fails today (RED) — initApp() does not
 * read window.__APP_ROOT__ yet. See tests/README.md.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  describe("app.js mounts into the root loadApp() created, not any live #root document-wide (issue #54, bug 3)", () => {
    it("renders app content inside the root loadApp() returned, not into a live #root that precedes it in the document", async () => {
      window.installMockHls();

      // Simulates index.html's static <div id="root"> — present before the
      // fixtures container, so it wins a document-wide getElementById lookup.
      const liveRoot = document.createElement("div");
      liveRoot.id = "root";
      liveRoot.dataset.testid = "live-app-marker";
      document.body.insertBefore(liveRoot, document.body.firstChild);

      let testRoot;
      try {
        testRoot = await loadApp();

        expect(testRoot.querySelector('[data-testid="listen-button"]')).toBeTruthy();
        expect(liveRoot.querySelector('[data-testid="listen-button"]')).toBeFalsy();
      } finally {
        if (testRoot) unloadApp(testRoot);
        if (liveRoot.parentNode) liveRoot.parentNode.removeChild(liveRoot);
      }
    });
  });
})();
