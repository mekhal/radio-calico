/**
 * Issue #41 (split from #38, Ticket 2 of 2): on-demand Test Report modal via
 * in-DOM test injection. Depends on #40 (harness serialization fix).
 * AC covered:
 *   - Footer's "Test Report" control (`data-testid="footer-test-report-link"`)
 *     is a <button>, not a link.
 *   - Clicking it opens a modal; suites are not fetched/run until that click.
 *   - The modal runs the suites via in-DOM injection (no <iframe>) into a
 *     dedicated, namespaced, off-screen container distinct from the live
 *     app's #root; the live app's mounted DOM is left untouched.
 *   - Modal is styled per the style guide, always dark (independent of the
 *     app's own light/dark toggle).
 *   - Escape closes the modal; focus moves into the modal on open and
 *     returns to the trigger button on close.
 *   - Re-opening the modal re-runs the suites every time (no caching).
 *   - Modal shows a pass/fail summary/list and is closable via a close
 *     button and via click-outside.
 * These fail today (RED) — app.js's footer control is still an <a> and no
 * modal exists. See tests/README.md for how to run this suite.
 *
 * Contract this suite assumes the implementation will expose (data-testid,
 * unless noted):
 *   - test-report-modal          the modal dialog container
 *   - test-report-modal-backdrop the click-outside backdrop
 *   - test-report-modal-close    the modal's close button
 *   - test-report-summary        pass/fail summary text (mirrors
 *                                 test-runner.html's #summary)
 *   - test-report-results        results list (mirrors test-runner.html's
 *                                 #results; <li class="pass"|"fail"> items)
 *   - test-report-fixtures       the off-screen in-DOM injection container,
 *                                 distinct from #root
 *
 * Implementation note: the modal's injected suite must NOT include this file
 * or tests/load-app-isolation.test.js (self-referential inclusion would
 * recurse — a modal test opening a modal opening a modal). It should mirror
 * the suite test-runner.html runs today (harness-serialization,
 * hero-listen-now-control, status-indicators-error-recovery,
 * theme-toggle-footer).
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  const TEST_FILE_PATTERN = /(\.test\.js|\/assert\.js)(\?|$)/i;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function waitFor(predicate, { timeout = 3000, interval = 50 } = {}) {
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

  function spyOnFetch() {
    const calls = [];
    const original = window.fetch;
    window.fetch = function (input) {
      const url = typeof input === "string" ? input : (input && input.url) || String(input);
      calls.push(url);
      return original.apply(this, arguments);
    };
    return {
      calls,
      matching(pattern) {
        return calls.filter((url) => pattern.test(url));
      },
      restore() {
        window.fetch = original;
      },
    };
  }

  function findFooterTestReportButton(root) {
    return root.querySelector('[data-testid="footer-test-report-link"]');
  }

  function findModal() {
    return document.querySelector('[data-testid="test-report-modal"]');
  }

  function findModalBackdrop() {
    return document.querySelector('[data-testid="test-report-modal-backdrop"]');
  }

  function findModalClose() {
    return document.querySelector('[data-testid="test-report-modal-close"]');
  }

  function findFixturesContainer() {
    return document.querySelector('[data-testid="test-report-fixtures"]');
  }

  async function openModal(button) {
    button.click();
    return waitFor(() => findModal());
  }

  describe("Test Report modal (issue #41, Ticket 2)", () => {
    it("renders the footer's Test Report control as a button, not a link", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const control = findFooterTestReportButton(root);
      expect(control).toBeTruthy();
      expect(control.tagName).toBe("BUTTON");
      expect(control.hasAttribute("href")).toBeFalsy();

      unloadApp(root);
    });

    it("does not fetch or run any suites until the button is clicked", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const fetchSpy = spyOnFetch();
      try {
        await nextTick();
        expect(fetchSpy.matching(TEST_FILE_PATTERN).length).toBe(0);
        expect(findModal()).toBeFalsy();
      } finally {
        fetchSpy.restore();
      }

      unloadApp(root);
    });

    it("opens a modal and begins fetching the suite when the button is clicked", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const fetchSpy = spyOnFetch();
      try {
        const button = findFooterTestReportButton(root);
        const modal = await openModal(button);

        expect(modal).toBeTruthy();
        await waitFor(() => fetchSpy.matching(TEST_FILE_PATTERN).length > 0);

        const closeButton = findModalClose();
        if (closeButton) closeButton.click();
      } finally {
        fetchSpy.restore();
      }

      unloadApp(root);
    });

    it("injects the suite in-DOM (no iframe) into an off-screen container distinct from #root, leaving the live app untouched", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const listenButton = root.querySelector('[data-testid="listen-button"]');
      const button = findFooterTestReportButton(root);
      const modal = await openModal(button);

      expect(modal.querySelector("iframe")).toBeFalsy();

      // The live app's own mount must be left exactly as it was.
      expect(document.getElementById("root")).toBe(root);
      expect(root.querySelector('[data-testid="listen-button"]')).toBe(listenButton);

      const fixtures = await waitFor(() => findFixturesContainer());
      expect(fixtures.id === "root").toBeFalsy();

      const rect = fixtures.getBoundingClientRect();
      expect(rect.left <= -1000 || rect.top <= -1000).toBeTruthy();

      const closeButton = findModalClose();
      if (closeButton) closeButton.click();

      unloadApp(root);
    });

    it("always renders in the dark palette, independent of the app's light/dark toggle", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const themeToggle = root.querySelector('[data-testid="theme-toggle"]');
      themeToggle.click();
      await nextTick();
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");

      const button = findFooterTestReportButton(root);
      const modal = await openModal(button);

      const style = window.getComputedStyle(modal);
      expect(style.backgroundColor).toBe("rgb(35, 31, 32)"); // #231F20 Charcoal
      expect(style.color).toBe("rgb(255, 255, 255)");

      const closeButton = findModalClose();
      if (closeButton) closeButton.click();

      unloadApp(root);
    });

    it("moves focus into the modal when it opens", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const button = findFooterTestReportButton(root);
      const modal = await openModal(button);

      expect(modal.contains(document.activeElement)).toBeTruthy();

      const closeButton = findModalClose();
      if (closeButton) closeButton.click();

      unloadApp(root);
    });

    it("closes on Escape and returns focus to the trigger button", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const button = findFooterTestReportButton(root);
      await openModal(button);

      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
      );
      await waitFor(() => !findModal());

      expect(document.activeElement).toBe(button);

      unloadApp(root);
    });

    it("closes via the close button and returns focus to the trigger button", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const button = findFooterTestReportButton(root);
      await openModal(button);

      const closeButton = findModalClose();
      expect(closeButton).toBeTruthy();
      closeButton.click();
      await waitFor(() => !findModal());

      expect(document.activeElement).toBe(button);

      unloadApp(root);
    });

    it("closes when clicking outside the modal (on the backdrop)", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const button = findFooterTestReportButton(root);
      await openModal(button);

      const backdrop = findModalBackdrop();
      expect(backdrop).toBeTruthy();
      backdrop.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await waitFor(() => !findModal());

      unloadApp(root);
    });

    it("re-runs the suite every time the modal is re-opened (no caching)", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const fetchSpy = spyOnFetch();
      try {
        const button = findFooterTestReportButton(root);

        await openModal(button);
        await waitFor(() => fetchSpy.matching(TEST_FILE_PATTERN).length > 0);
        const firstRunCount = fetchSpy.matching(TEST_FILE_PATTERN).length;

        const closeButton = findModalClose();
        closeButton.click();
        await waitFor(() => !findModal());

        await openModal(button);
        await waitFor(() => fetchSpy.matching(TEST_FILE_PATTERN).length > firstRunCount);

        const secondCloseButton = findModalClose();
        if (secondCloseButton) secondCloseButton.click();
      } finally {
        fetchSpy.restore();
      }

      unloadApp(root);
    });

    it("shows a pass/fail summary and results list, same as test-runner.html", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const button = findFooterTestReportButton(root);
      await openModal(button);

      const summary = await waitFor(
        () => {
          const el = document.querySelector('[data-testid="test-report-summary"]');
          return el && /\d+\s*\/\s*\d+\s*passed/i.test(el.textContent || "") ? el : null;
        },
        { timeout: 10000 }
      );
      expect(summary).toBeTruthy();

      const items = document.querySelectorAll(
        '[data-testid="test-report-results"] li.pass, [data-testid="test-report-results"] li.fail'
      );
      expect(items.length).toBeGreaterThan(0);

      const closeButton = findModalClose();
      if (closeButton) closeButton.click();

      unloadApp(root);
    });
  });
})();
