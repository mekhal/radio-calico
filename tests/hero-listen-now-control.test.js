/**
 * Ticket A (issue #20): "Listen Now" hero button -> single play/pause control.
 * AC covered:
 *   - Button visible on load, styled per style guide (bg #1F4E23, white text,
 *     4px radius, uppercase, hover -> #38A29D).
 *   - No native <audio controls>/autoPlay — exactly one custom control.
 *   - Clicking starts playback and the button becomes a play/pause toggle.
 *   - Control is keyboard-accessible (Enter/Space activate it).
 * These fail today (RED) — app.js has no button yet, only the placeholder
 * <audio controls autoPlay>. See tests/README.md for how to run this suite.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function spyOnPlay() {
    const calls = [];
    const original = window.HTMLMediaElement.prototype.play;
    window.HTMLMediaElement.prototype.play = function () {
      calls.push(this);
      return Promise.resolve();
    };
    return {
      calls,
      restore: () => {
        window.HTMLMediaElement.prototype.play = original;
      },
    };
  }

  function findListenButton(root) {
    return root.querySelector("button");
  }

  describe("Hero Listen Now / playback control (issue #20, Ticket A)", () => {
    it("shows a single Listen Now button styled per the style guide", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const button = findListenButton(root);
      expect(button).toBeTruthy();
      expect((button.textContent || "").trim().toUpperCase()).toContain("LISTEN NOW");

      const style = window.getComputedStyle(button);
      expect(style.backgroundColor).toBe("rgb(31, 78, 35)"); // #1F4E23
      expect(style.color).toBe("rgb(255, 255, 255)");
      expect(style.borderRadius).toBe("4px");
      expect(style.textTransform).toBe("uppercase");

      unloadApp(root);
    });

    it("changes to the hover color and back per the style guide", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const button = findListenButton(root);
      button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      const hoverColor = window.getComputedStyle(button).backgroundColor;
      expect(hoverColor).toBe("rgb(56, 162, 157)"); // #38A29D

      button.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      const restedColor = window.getComputedStyle(button).backgroundColor;
      expect(restedColor).toBe("rgb(31, 78, 35)"); // #1F4E23

      unloadApp(root);
    });

    it("renders exactly one playback control — no native <audio controls>/autoPlay", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const audio = root.querySelector("audio");
      expect(audio).toBeTruthy();
      expect(audio.hasAttribute("controls")).toBeFalsy();
      expect(audio.hasAttribute("autoplay")).toBeFalsy();
      expect(root.querySelectorAll("button").length).toBe(1);

      unloadApp(root);
    });

    it("starts playback and toggles to Pause when the button is clicked", async () => {
      window.installMockHls();
      const playSpy = spyOnPlay();
      const root = await loadApp();
      await nextTick();

      const button = findListenButton(root);
      button.click();
      await nextTick();

      expect(playSpy.calls.length).toBeGreaterThan(0);
      expect((button.textContent || "").trim().toUpperCase()).toContain("PAUSE");

      playSpy.restore();
      unloadApp(root);
    });

    it("is keyboard-accessible — Enter and Space activate the control", async () => {
      window.installMockHls();
      const playSpy = spyOnPlay();
      const root = await loadApp();
      await nextTick();

      const button = findListenButton(root);
      expect(button.tagName).toBe("BUTTON");

      button.focus();
      expect(document.activeElement).toBe(button);

      button.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
      );
      await nextTick();
      expect(playSpy.calls.length).toBeGreaterThan(0);

      playSpy.restore();
      unloadApp(root);
    });
  });
})();
