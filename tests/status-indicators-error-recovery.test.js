/**
 * Ticket B (issue #25): status indicators + error recovery for the Listen Now control.
 * AC covered:
 *   - The control (Listen Now / Pause button) stays clickable — never disabled —
 *     while loading, buffering, or after a fatal error.
 *   - A "LIVE" indicator appears once the stream is actually playing.
 *   - A small, subtle "buffering" indicator appears only during stalls and never
 *     disables or visually overlaps the main control.
 *   - A fatal HLS error shows an error message and a "Refresh" button that reloads
 *     the page — no crash, no dead end.
 * These fail today (RED) — app.js has no LIVE/buffering/error UI yet, only a
 * status paragraph and the Ticket A play/pause button. See tests/README.md for
 * how to run this suite.
 *
 * Issue #54: this file no longer asserts that clicking Refresh actually calls
 * reload() — overriding window.location.reload is a browser security
 * restriction real browsers don't honor consistently, so the assertion was a
 * false negative (app.js's reload behavior was correct; the test's stub
 * wasn't reliable). The "shows an error message and a Refresh button" test
 * below still covers the button rendering with the right label.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function findListenButton(root) {
    return root.querySelector('[data-testid="listen-button"]') || root.querySelector("button");
  }

  function findLiveIndicator(root) {
    return root.querySelector('[data-testid="live-indicator"]');
  }

  function findBufferingIndicator(root) {
    return root.querySelector('[data-testid="buffering-indicator"]');
  }

  function findErrorMessage(root) {
    return root.querySelector('[data-testid="error-message"]');
  }

  function findRefreshButton(root) {
    return root.querySelector('[data-testid="refresh-button"]');
  }

  function isVisible(el) {
    if (!el) return false;
    if (el.hidden) return false;
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function rectsOverlap(a, b) {
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  }

  describe("Status indicators + error recovery (issue #25, Ticket B)", () => {
    it("keeps the control clickable (not disabled) while loading", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      expect(findListenButton(root).disabled).toBeFalsy();

      unloadApp(root);
    });

    it("keeps the control clickable (not disabled) while buffering", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      window.latestHlsInstance().trigger(window.Hls.Events.MANIFEST_PARSED);
      root.querySelector("audio").dispatchEvent(new Event("waiting"));
      await nextTick();

      expect(findListenButton(root).disabled).toBeFalsy();

      unloadApp(root);
    });

    it("keeps the control clickable (not disabled) after a fatal error", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      window.latestHlsInstance().trigger(window.Hls.Events.ERROR, { fatal: true });
      await nextTick();

      expect(findListenButton(root).disabled).toBeFalsy();

      unloadApp(root);
    });

    it("shows no LIVE indicator until the stream is actually playing", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      expect(isVisible(findLiveIndicator(root))).toBeFalsy();

      unloadApp(root);
    });

    it('shows a "LIVE" indicator once the stream is playing', async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      window.latestHlsInstance().trigger(window.Hls.Events.MANIFEST_PARSED);
      root.querySelector("audio").dispatchEvent(new Event("playing"));
      await nextTick();

      expect(isVisible(findLiveIndicator(root))).toBeTruthy();

      unloadApp(root);
    });

    it("hides the LIVE indicator again once playback is paused", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      window.latestHlsInstance().trigger(window.Hls.Events.MANIFEST_PARSED);
      const audio = root.querySelector("audio");
      audio.dispatchEvent(new Event("playing"));
      await nextTick();
      expect(isVisible(findLiveIndicator(root))).toBeTruthy();

      audio.dispatchEvent(new Event("pause"));
      await nextTick();
      expect(isVisible(findLiveIndicator(root))).toBeFalsy();

      unloadApp(root);
    });

    it("shows a buffering indicator only while the stream stalls", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      expect(isVisible(findBufferingIndicator(root))).toBeFalsy();

      const audio = root.querySelector("audio");
      audio.dispatchEvent(new Event("waiting"));
      await nextTick();
      expect(isVisible(findBufferingIndicator(root))).toBeTruthy();

      audio.dispatchEvent(new Event("playing"));
      await nextTick();
      expect(isVisible(findBufferingIndicator(root))).toBeFalsy();

      unloadApp(root);
    });

    it("never lets the buffering indicator disable or visually cover the main control", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      root.querySelector("audio").dispatchEvent(new Event("waiting"));
      await nextTick();

      const indicator = findBufferingIndicator(root);
      const button = findListenButton(root);
      expect(isVisible(indicator)).toBeTruthy();
      expect(button.disabled).toBeFalsy();
      expect(rectsOverlap(indicator.getBoundingClientRect(), button.getBoundingClientRect())).toBeFalsy();

      unloadApp(root);
    });

    it("shows an error message and a Refresh button on a fatal HLS error", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      window.latestHlsInstance().trigger(window.Hls.Events.ERROR, { fatal: true });
      await nextTick();

      const errorMessage = findErrorMessage(root);
      expect(isVisible(errorMessage)).toBeTruthy();
      expect((errorMessage.textContent || "").length).toBeGreaterThan(0);

      const refreshButton = findRefreshButton(root);
      expect(isVisible(refreshButton)).toBeTruthy();
      expect((refreshButton.textContent || "").trim().toUpperCase()).toContain("REFRESH");

      unloadApp(root);
    });

    it("ignores non-fatal HLS errors — no error UI, control keeps working", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      window.latestHlsInstance().trigger(window.Hls.Events.ERROR, { fatal: false });
      await nextTick();

      expect(isVisible(findErrorMessage(root))).toBeFalsy();
      expect(findListenButton(root).disabled).toBeFalsy();

      unloadApp(root);
    });
  });
})();
