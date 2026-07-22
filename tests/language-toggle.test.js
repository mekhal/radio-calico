/**
 * Ticket C (issue #101): EN/TH language toggle in the header bar.
 * AC covered:
 *   - AC1/AC5: lives in the nav bar alongside the theme toggle, as a
 *     role="switch" control (not a button/dropdown), sharing its parent
 *     with the theme toggle.
 *   - AC2: a two-state switch, defaulting to English on first load.
 *   - AC3: toggling switches user-facing static text (heading, playback
 *     button, footer disclaimer) between English and Thai, and the
 *     selection persists in localStorage and is restored on reload.
 *   - AC4: the theme toggle's testid/role/click-and-keyboard behavior are
 *     unchanged by the sliding-switch redesign — only its CSS/markup style.
 * Translations are fetched from i18n/en.json + i18n/th.json (AC6); app.js
 * exposes window.__i18nReady so tests can deterministically await that
 * fetch instead of racing an arbitrary number of ticks against it.
 * See tests/README.md for how to run this suite.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  const LANGUAGE_STORAGE_KEY = "radioCalicoLanguage";

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function findLangToggle(root) {
    return root.querySelector('[data-testid="language-toggle"]');
  }

  function findThemeToggle(root) {
    return root.querySelector('[data-testid="theme-toggle"]');
  }

  function findNavBar(root) {
    return root.querySelector('[data-testid="nav-bar"]');
  }

  function activeLabelText(toggle) {
    const active = toggle.querySelector(".rc-switch-label.is-active");
    return active ? active.textContent : null;
  }

  async function loadReady() {
    window.installMockHls();
    const root = await loadApp();
    await nextTick();
    await window.__i18nReady;
    return root;
  }

  describe("Language toggle (issue #101, Ticket C)", () => {
    it("defaults to English on first load, with no stored preference", async () => {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      const root = await loadReady();

      const heading = root.querySelector("h1");
      expect(heading.textContent).toBe("Radio Calico");
      expect((root.querySelector('[data-testid="listen-button"]').textContent || "").trim()).toBe(
        "Listen Now"
      );

      const toggle = findLangToggle(root);
      expect(toggle).toBeTruthy();
      expect(toggle.getAttribute("aria-checked")).toBe("false");
      expect(activeLabelText(toggle)).toBe("EN");

      unloadApp(root);
    });

    it("is a role=switch control living in the nav bar, alongside the theme toggle", async () => {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      const root = await loadReady();

      const navBar = findNavBar(root);
      const toggle = findLangToggle(root);
      const themeToggle = findThemeToggle(root);

      expect(toggle).toBeTruthy();
      expect(toggle.getAttribute("role")).toBe("switch");
      expect(toggle.tagName).not.toBe("BUTTON");
      expect(toggle.tagName).not.toBe("SELECT");
      expect(navBar.contains(toggle)).toBeTruthy();
      expect(navBar.contains(themeToggle)).toBeTruthy();
      expect(toggle.parentElement).toBe(themeToggle.parentElement);

      unloadApp(root);
    });

    it("switches user-facing text to Thai when activated, and flips aria-checked", async () => {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      const root = await loadReady();

      const toggle = findLangToggle(root);
      toggle.click();
      await nextTick();

      expect(toggle.getAttribute("aria-checked")).toBe("true");
      expect(activeLabelText(toggle)).toBe("TH");

      const heading = root.querySelector("h1");
      expect(heading.textContent).toBe("Radio Calico");
      expect((root.querySelector('[data-testid="listen-button"]').textContent || "").trim()).toBe(
        "ฟังเลย"
      );

      const footer = root.querySelector('[data-testid="footer"]');
      expect((footer.textContent || "").includes("Radio Calico")).toBeTruthy();
      expect((footer.textContent || "").includes("independent internet radio stream")).toBeFalsy();

      unloadApp(root);
    });

    it("switches back to English when activated again", async () => {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      const root = await loadReady();

      const toggle = findLangToggle(root);
      toggle.click();
      await nextTick();
      expect(activeLabelText(toggle)).toBe("TH");

      toggle.click();
      await nextTick();
      expect(activeLabelText(toggle)).toBe("EN");
      expect(toggle.getAttribute("aria-checked")).toBe("false");
      expect((root.querySelector('[data-testid="listen-button"]').textContent || "").trim()).toBe(
        "Listen Now"
      );

      unloadApp(root);
    });

    it("is keyboard-accessible — Enter activates the toggle", async () => {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      const root = await loadReady();

      const toggle = findLangToggle(root);
      toggle.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
      );
      await nextTick();

      expect(activeLabelText(toggle)).toBe("TH");

      unloadApp(root);
    });

    it("persists the selection to localStorage and restores it on reload", async () => {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      const root = await loadReady();

      findLangToggle(root).click();
      await nextTick();
      expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("th");

      unloadApp(root);

      // Simulate a reload: fresh mount, same localStorage.
      const reloadedRoot = await loadReady();

      const reloadedToggle = findLangToggle(reloadedRoot);
      expect(reloadedToggle.getAttribute("aria-checked")).toBe("true");
      expect(activeLabelText(reloadedToggle)).toBe("TH");
      expect(
        (reloadedRoot.querySelector('[data-testid="listen-button"]').textContent || "").trim()
      ).toBe("ฟังเลย");

      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      unloadApp(reloadedRoot);
    });

    it("keeps the theme toggle's testid/role/behavior unchanged after the sliding-switch redesign", async () => {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      const root = await loadReady();

      const themeToggle = findThemeToggle(root);
      expect(themeToggle.dataset.testid).toBe("theme-toggle");
      expect(themeToggle.getAttribute("role")).toBe("switch");

      themeToggle.click();
      await nextTick();
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");

      unloadApp(root);
    });

    it("shows a moon/sun icon on the theme toggle's thumb, matching the current theme", async () => {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      const root = await loadReady();

      const themeToggle = findThemeToggle(root);
      const thumb = themeToggle.querySelector(".rc-switch-thumb");
      expect(thumb.textContent).toBe("🌙");

      themeToggle.click();
      await nextTick();
      expect(thumb.textContent).toBe("☀️");

      themeToggle.click();
      await nextTick();
      expect(thumb.textContent).toBe("🌙");

      unloadApp(root);
    });

    it("flips the theme toggle's aria-checked to match the actual theme on every click (not inverted)", async () => {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      const root = await loadReady();

      const themeToggle = findThemeToggle(root);
      expect(themeToggle.getAttribute("aria-checked")).toBe("false");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

      themeToggle.click();
      await nextTick();
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      expect(themeToggle.getAttribute("aria-checked")).toBe("true");

      themeToggle.click();
      await nextTick();
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(themeToggle.getAttribute("aria-checked")).toBe("false");

      unloadApp(root);
    });

    it("renders the language toggle thumb as an SVG flag icon, not emoji/text that can fall back to literal country codes", async () => {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      const root = await loadReady();

      const toggle = findLangToggle(root);
      const thumb = toggle.querySelector(".rc-switch-thumb");
      expect(thumb.querySelector("svg")).toBeTruthy();
      expect((thumb.textContent || "").trim()).toBe("");

      toggle.click();
      await nextTick();
      expect(thumb.querySelector("svg")).toBeTruthy();
      expect((thumb.textContent || "").trim()).toBe("");

      unloadApp(root);
    });
  });
})();
