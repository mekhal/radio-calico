/**
 * Issue #54: the footer's on-demand Test Report modal (issue #41) must load
 * its own CDN dependencies (React/ReactDOM/Babel) before running the
 * injected suite — tests/load-app.js's loadApp() needs window.Babel to
 * mount app.js. tests/test-runner.html happens to already load these from a
 * CDN via its own <script> tags, which is why the suite works there. But
 * the real index.html page (e.g. GitHub Pages) never loads them, so on that
 * page runTestReportSuite() calls window.Babel.transform(...) against
 * `undefined`, and every suite test that calls loadApp() fails with
 * "Cannot read properties of undefined (reading 'transform')" (see issue
 * #54's report — 21 of 23 tests failed this way).
 *
 * This test simulates that real-page condition by deleting window.Babel
 * before opening the modal, then asserts the modal's own run recovers it
 * (i.e. it loads Babel itself rather than assuming it is already present).
 * Fails today (RED) — runTestReportSuite() never loads CDN deps itself.
 * See tests/README.md.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function waitFor(predicate, { timeout = 10000, interval = 50 } = {}) {
    const start = Date.now();
    for (;;) {
      const value = predicate();
      if (value) return value;
      if (Date.now() - start >= timeout) {
        throw new Error("waitFor: timed out waiting for condition");
      }
      await wait(interval);
    }
  }

  function findFooterTestReportButton(root) {
    return root.querySelector('[data-testid="footer-test-report-link"]');
  }

  describe("Test Report modal loads its own CDN deps (issue #54)", () => {
    it("loads Babel itself when opened, even if it wasn't already on the page", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const savedBabel = window.Babel;
      delete window.Babel;

      try {
        const button = findFooterTestReportButton(root);
        expect(button).toBeTruthy();
        button.click();

        const babel = await waitFor(
          () => window.Babel && typeof window.Babel.transform === "function" && window.Babel
        );
        expect(typeof babel.transform).toBe("function");

        const closeButton = document.querySelector('[data-testid="test-report-modal-close"]');
        if (closeButton) closeButton.click();
      } finally {
        window.Babel = savedBabel;
      }

      unloadApp(root);
    });
  });
})();
