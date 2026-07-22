(function () {
  const STREAM_URL = "https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8";

  const REST_BACKGROUND = "#1F4E23";
  const HOVER_BACKGROUND = "#38A29D";

  const THEME_STYLE_ID = "radio-calico-theme-styles";
  const THEME_CSS = `
    [data-theme="dark"] body { background: #231F20; color: #FFFFFF; }
    [data-theme="light"] body { background: #F5EADA; color: #231F20; }
    [data-theme="dark"] footer[data-testid="footer"] { background: transparent; color: #FFFFFF; }
    [data-theme="light"] footer[data-testid="footer"] { background: #F5EADA; color: #1F4E23; }
    footer[data-testid="footer"] a { color: #38A29D; }
  `;

  function ensureThemeStyles() {
    if (document.getElementById(THEME_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = THEME_STYLE_ID;
    style.textContent = THEME_CSS;
    document.head.appendChild(style);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  // Ticket C (issue #101), AC6 (amended per review comment on 2026-07-22):
  // strings live in i18n/en.json + i18n/th.json, loaded via fetch() rather
  // than an inline dictionary — confirmed safe since the human signed off
  // that this app always runs over http(s) (never opened via file://, whose
  // CORS policy would otherwise block the fetch — see tests/README.md).
  //
  // window.__I18N_BASE_PATH__ mirrors the window.__APP_JS_PATH__ override
  // pattern below: tests/test-runner.html sets it to "../i18n/" because that
  // page lives one directory under the repo root, while the live index.html
  // page (and the footer's Test Report modal, which also runs from that same
  // root document) can resolve the default "i18n/" as-is.
  const LANGUAGE_STORAGE_KEY = "radioCalicoLanguage";
  const I18N_BASE_PATH = window.__I18N_BASE_PATH__ || "i18n/";

  function getStoredLanguage() {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "th" ? "th" : "en";
  }

  function setStoredLanguage(lang) {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }

  async function loadTranslations() {
    const [enResponse, thResponse] = await Promise.all([
      fetch(`${I18N_BASE_PATH}en.json`),
      fetch(`${I18N_BASE_PATH}th.json`),
    ]);
    const [en, th] = await Promise.all([enResponse.json(), thResponse.json()]);
    return { en, th };
  }

  // Issue #41: on-demand Test Report modal. Runs the suite in-DOM (no
  // <iframe>) inside an off-screen fixtures container, distinct from the
  // live app's #root. Guarded by a document-wide flag because the suite
  // itself includes theme-toggle-footer.test.js, whose own test clicks this
  // same control — without the guard, that would recursively fetch and
  // re-run the whole suite from inside itself.
  //
  // Issue #54: unlike tests/test-runner.html, index.html never loads
  // React/ReactDOM/Babel — tests/load-app.js's loadApp() needs window.Babel
  // to mount app.js, so those CDN deps must be loaded here before the suite
  // runs. Pinned to the same major versions tests/test-runner.html uses.
  const TEST_REPORT_CDN_DEPS = [
    { isLoaded: () => Boolean(window.React), src: "https://unpkg.com/react@18/umd/react.production.min.js" },
    { isLoaded: () => Boolean(window.ReactDOM), src: "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" },
    { isLoaded: () => Boolean(window.Babel), src: "https://unpkg.com/@babel/standalone@7/babel.min.js" },
  ];

  function loadScriptTag(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  async function ensureTestReportCdnDeps() {
    for (const dep of TEST_REPORT_CDN_DEPS) {
      if (!dep.isLoaded()) {
        await loadScriptTag(dep.src);
      }
    }
  }

  async function fetchAndInjectScript(path) {
    const response = await fetch(path);
    const source = await response.text();
    const script = document.createElement("script");
    script.textContent = source;
    document.body.appendChild(script);
    document.body.removeChild(script);
  }

  // Issue #67, AC2: each result's name is "<suite> > <case>" (assert.js's
  // describe/it nesting) — grouped here into a list per suite with a
  // sub-list per case, so the modal reads as "what's tested" rather than a
  // flat wall of assertions.
  function groupResultsBySuite(results) {
    const groups = [];
    const groupsBySuite = new Map();
    results.forEach((result) => {
      const separatorIndex = result.name.lastIndexOf(" > ");
      const suite = separatorIndex === -1 ? result.name : result.name.slice(0, separatorIndex);
      const label = separatorIndex === -1 ? result.name : result.name.slice(separatorIndex + 3);
      if (!groupsBySuite.has(suite)) {
        const group = { suite, cases: [] };
        groupsBySuite.set(suite, group);
        groups.push(group);
      }
      groupsBySuite.get(suite).cases.push({ label, passed: result.passed, error: result.error });
    });
    return groups;
  }

  function renderTestReportResults(summaryEl, listEl, results) {
    listEl.innerHTML = "";

    groupResultsBySuite(results).forEach((group) => {
      const suitePassed = group.cases.every((testCase) => testCase.passed);

      const suiteItem = document.createElement("li");
      suiteItem.className = suitePassed ? "pass" : "fail";
      Object.assign(suiteItem.style, {
        padding: "8px 12px",
        borderRadius: "4px",
        marginBottom: "4px",
        background: suitePassed ? "rgba(216, 242, 213, 0.15)" : "rgba(239, 166, 60, 0.2)",
        borderLeft: `3px solid ${suitePassed ? "#D8F2D5" : "#EFA63C"}`,
      });

      const suiteLabel = document.createElement("span");
      suiteLabel.style.fontWeight = "600";
      suiteLabel.textContent = `${suitePassed ? "✓" : "✗"} ${group.suite}`;
      suiteItem.appendChild(suiteLabel);

      const caseList = document.createElement("ul");
      Object.assign(caseList.style, { listStyle: "none", margin: "4px 0 0 1rem", padding: "0" });

      group.cases.forEach((testCase) => {
        const caseItem = document.createElement("li");
        caseItem.className = testCase.passed ? "pass" : "fail";
        caseItem.textContent = `${testCase.passed ? "✓" : "✗"} ${testCase.label}`;
        Object.assign(caseItem.style, { padding: "2px 0", fontSize: "0.875rem" });
        if (!testCase.passed) {
          const error = document.createElement("span");
          error.className = "error";
          error.textContent = testCase.error;
          Object.assign(error.style, {
            display: "block",
            fontSize: "0.8125rem",
            marginTop: "2px",
            color: "#F5EADA",
          });
          caseItem.appendChild(error);
        }
        caseList.appendChild(caseItem);
      });

      suiteItem.appendChild(caseList);
      listEl.appendChild(suiteItem);
    });

    const passed = results.filter((result) => result.passed).length;
    summaryEl.textContent = `${passed} / ${results.length} passed`;
  }

  async function runTestReportSuite(summaryEl, listEl, isClosed) {
    if (window.__radioCalicoTestReportRunning) {
      summaryEl.textContent = "A test run is already in progress.";
      return;
    }
    window.__radioCalicoTestReportRunning = true;
    window.__APP_JS_PATH__ = "app.js";
    try {
      if (isClosed()) return;
      await ensureTestReportCdnDeps();
      if (isClosed()) return;
      await fetchAndInjectScript("tests/assert.js");
      if (isClosed()) return;
      await fetchAndInjectScript("tests/test-report-suite-files.js");

      const suiteFiles = ["tests/mock-hls.js", "tests/load-app.js"].concat(
        window.TEST_REPORT_SUITE_FILES.map((file) => `tests/${file}`)
      );

      for (const file of suiteFiles) {
        if (isClosed()) return;
        await fetchAndInjectScript(file);
      }

      if (isClosed()) return;
      await window.TestHarness.allSettled();
      if (isClosed()) return;

      renderTestReportResults(summaryEl, listEl, window.TestHarness.getResults());
    } catch (_error) {
      if (!isClosed()) summaryEl.textContent = "Test run failed to complete.";
    } finally {
      window.__radioCalicoTestReportRunning = false;
    }
  }

  function openTestReportModal(trigger) {
    let closed = false;
    const isClosed = () => closed;

    const fixtures = document.createElement("div");
    fixtures.id = "fixtures";
    fixtures.dataset.testid = "test-report-fixtures";
    Object.assign(fixtures.style, { position: "absolute", top: "-10000px", left: "-10000px" });

    const backdrop = document.createElement("div");
    backdrop.dataset.testid = "test-report-modal-backdrop";
    Object.assign(backdrop.style, {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      background: "rgba(0, 0, 0, 0.6)",
      zIndex: "1000",
    });

    const modal = document.createElement("div");
    modal.dataset.testid = "test-report-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Test Report");
    modal.tabIndex = -1;
    Object.assign(modal.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "min(90vw, 640px)",
      maxHeight: "80vh",
      overflowY: "auto",
      background: "#231F20",
      color: "#FFFFFF",
      borderRadius: "4px",
      padding: "1.5rem",
      zIndex: "1001",
      fontFamily: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
    });

    const header = document.createElement("div");
    Object.assign(header.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
    });

    const title = document.createElement("h2");
    title.textContent = "Test Report";
    Object.assign(title.style, {
      fontFamily: '"Montserrat", sans-serif',
      margin: "0",
      fontSize: "1.5rem",
    });

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.dataset.testid = "test-report-modal-close";
    closeButton.textContent = "✕";
    closeButton.setAttribute("aria-label", "Close");
    Object.assign(closeButton.style, {
      background: "transparent",
      color: "#FFFFFF",
      border: "2px solid #FFFFFF",
      borderRadius: "4px",
      cursor: "pointer",
      padding: "0.25rem 0.6rem",
    });

    header.appendChild(title);
    header.appendChild(closeButton);

    const summary = document.createElement("p");
    summary.dataset.testid = "test-report-summary";
    summary.textContent = "Running tests…";
    Object.assign(summary.style, { fontWeight: "600", marginBottom: "1rem" });

    const results = document.createElement("ul");
    results.dataset.testid = "test-report-results";
    Object.assign(results.style, { listStyle: "none", padding: "0", margin: "0" });

    modal.appendChild(header);
    modal.appendChild(summary);
    modal.appendChild(results);

    function closeModal() {
      if (closed) return;
      closed = true;
      // Clear the reentrancy flag synchronously on close (rather than only
      // in runTestReportSuite's finally) so re-opening immediately starts a
      // fresh run instead of racing the previous run's in-flight fetch to
      // notice it was closed.
      window.__radioCalicoTestReportRunning = false;
      document.removeEventListener("keydown", onKeyDown);
      if (modal.parentNode) modal.parentNode.removeChild(modal);
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      if (fixtures.parentNode) fixtures.parentNode.removeChild(fixtures);
      if (trigger && typeof trigger.focus === "function") trigger.focus();
    }

    function onKeyDown(event) {
      if (event.key === "Escape") closeModal();
    }

    backdrop.addEventListener("click", closeModal);
    closeButton.addEventListener("click", closeModal);
    document.addEventListener("keydown", onKeyDown);

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    document.body.appendChild(fixtures);

    modal.focus();

    runTestReportSuite(summary, results, isClosed);
  }

  // Ticket C (issue #101), AC1/AC5: both the theme and language toggles
  // share this pill/thumb "sliding switch" construction (role="switch",
  // click + Enter/Space keyboard support — same interaction pattern the
  // theme toggle already had pre-redesign), styled via the .rc-switch rules
  // in styles.css. Side labels flank the track; which one is emphasized is
  // controlled by toggling "is-active" on offLabel/onLabel.
  function createSwitch(testid, ariaLabel, variantClass) {
    const wrapper = document.createElement("div");
    wrapper.dataset.testid = testid;
    wrapper.className = `rc-switch ${variantClass}`;
    wrapper.setAttribute("role", "switch");
    wrapper.setAttribute("tabindex", "0");
    wrapper.setAttribute("aria-label", ariaLabel);
    wrapper.setAttribute("aria-checked", "false");

    const offLabel = document.createElement("span");
    offLabel.className = "rc-switch-label is-active";

    const track = document.createElement("span");
    track.className = "rc-switch-track";
    const thumb = document.createElement("span");
    thumb.className = "rc-switch-thumb";
    track.appendChild(thumb);

    const onLabel = document.createElement("span");
    onLabel.className = "rc-switch-label";

    wrapper.appendChild(offLabel);
    wrapper.appendChild(track);
    wrapper.appendChild(onLabel);

    return { wrapper, offLabel, onLabel, thumb };
  }

  function setSwitchActiveSide(control, isOnActive) {
    control.offLabel.classList.toggle("is-active", !isOnActive);
    control.onLabel.classList.toggle("is-active", isOnActive);
  }

  function bindSwitchActivation(wrapper, onActivate) {
    wrapper.addEventListener("click", onActivate);
    wrapper.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        onActivate();
      }
    });
  }

  function initApp() {
    ensureThemeStyles();
    setTheme("dark");

    let TRANSLATIONS = null;
    let currentLanguage = getStoredLanguage();
    let currentStatusKey = "statusLoading";

    // Prefer the root tests/load-app.js's loadApp() hands us explicitly —
    // document.getElementById("root") resolves document-wide and would pick
    // up a live page's own #root instead (issue #54, bug 3).
    const root = window.__APP_ROOT__ || document.getElementById("root");

    const heading = document.createElement("h1");
    heading.textContent = "Radio Calico";

    // Ticket C (issue #101), AC4 (redesign confirmed at the 2026-07-22
    // review): sliding-switch style — track + thumb, "Light"/"Dark" side
    // labels — replacing the prior bordered-text-box control. testid,
    // role="switch", and click/keyboard behavior are unchanged.
    const themeSwitch = createSwitch("theme-toggle", "Toggle dark/light theme", "rc-switch--theme");
    const themeToggle = themeSwitch.wrapper;
    themeSwitch.offLabel.textContent = "Light";
    themeSwitch.onLabel.textContent = "Dark";
    setSwitchActiveSide(themeSwitch, true); // defaults to dark (AC-unchanged default)

    function toggleTheme() {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const nextTheme = isDark ? "light" : "dark";
      setTheme(nextTheme);
      themeToggle.setAttribute("aria-checked", String(!isDark));
      setSwitchActiveSide(themeSwitch, nextTheme === "dark");
    }

    bindSwitchActivation(themeToggle, toggleTheme);

    // Ticket C (issue #101), AC2/AC5: a two-state EN/TH switch (not a
    // dropdown), defaulting to English. The thumb shows the active
    // language's flag; the side labels stay the literal codes "EN"/"TH" in
    // both languages (a code isn't translated), so only the active side and
    // the aria-label change with the current app language.
    const langSwitch = createSwitch("language-toggle", "Switch language", "rc-switch--lang");
    const langToggle = langSwitch.wrapper;
    langSwitch.offLabel.textContent = "EN";
    langSwitch.onLabel.textContent = "TH";
    langToggle.setAttribute("aria-checked", String(currentLanguage === "th"));
    setSwitchActiveSide(langSwitch, currentLanguage === "th");
    langSwitch.thumb.textContent = currentLanguage === "th" ? "🇹🇭" : "🇬🇧";

    function toggleLanguage() {
      if (!TRANSLATIONS) return;
      const nextLanguage = currentLanguage === "en" ? "th" : "en";
      setStoredLanguage(nextLanguage);
      langToggle.setAttribute("aria-checked", String(nextLanguage === "th"));
      setSwitchActiveSide(langSwitch, nextLanguage === "th");
      langSwitch.thumb.textContent = nextLanguage === "th" ? "🇹🇭" : "🇬🇧";
      applyLanguage(nextLanguage);
    }

    bindSwitchActivation(langToggle, toggleLanguage);

    // Ticket B (issue #100), AC7: nav bar landmark Ticket C's toggles (#101)
    // are added to, right-aligned as a group alongside the brand.
    const navBar = document.createElement("header");
    navBar.dataset.testid = "nav-bar";
    navBar.className = "masthead mb-auto";

    const navBarInner = document.createElement("div");
    navBarInner.className = "inner";

    const brand = document.createElement("div");
    brand.className = "masthead-brand";

    const brandLogo = document.createElement("span");
    brandLogo.className = "masthead-logo";
    brandLogo.setAttribute("aria-hidden", "true");

    const brandText = document.createElement("span");
    brandText.textContent = "Radio Calico";

    brand.appendChild(brandLogo);
    brand.appendChild(brandText);

    // Groups the two switches so they sit together, right-aligned against
    // the brand (`.masthead .inner`'s justify-content: space-between), per
    // Ticket C AC1 — rather than each control individually claiming a slot.
    const navToggles = document.createElement("div");
    navToggles.className = "masthead-toggles";
    navToggles.appendChild(langToggle);
    navToggles.appendChild(themeToggle);

    navBarInner.appendChild(brand);
    navBarInner.appendChild(navToggles);
    navBar.appendChild(navBarInner);

    // Ticket B (issue #100): footer sits in normal document flow at the
    // bottom of the Bootstrap Cover layout's flex column (`.mastfoot`, see
    // styles.css), rather than `position: fixed` — no body padding-bottom
    // workaround needed since it can no longer overlap page content.
    const footer = document.createElement("footer");
    footer.dataset.testid = "footer";
    footer.className = "mastfoot";

    const footerInner = document.createElement("div");

    const disclaimer = document.createElement("p");
    disclaimer.textContent =
      "Radio Calico is an independent internet radio stream. All music remains the property of its respective owners.";
    Object.assign(disclaimer.style, { margin: "0 0 0.375rem" });

    const linksRow = document.createElement("div");
    Object.assign(linksRow.style, {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: "1rem",
    });

    function createIconLink(testid, href, label, iconClass) {
      const link = document.createElement("a");
      link.dataset.testid = testid;
      link.href = href;
      link.title = label;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = label;
      Object.assign(link.style, { color: "#38A29D" });
      prependIcon(link, iconClass);
      return link;
    }

    function prependIcon(el, iconClass) {
      const icon = document.createElement("i");
      icon.className = iconClass;
      icon.setAttribute("aria-hidden", "true");
      Object.assign(icon.style, { marginRight: "0.375rem" });
      el.insertBefore(icon, el.firstChild);
    }

    const siteLink = document.createElement("a");
    siteLink.dataset.testid = "footer-site-link";
    siteLink.href = "https://www.radio-calico.com/";
    siteLink.target = "_blank";
    siteLink.rel = "noopener noreferrer";
    siteLink.textContent = "radio-calico.com";
    prependIcon(siteLink, "fa-solid fa-radio");
    // Text node captured after the icon is prepended (so it stays the last
    // child) — lets applyLanguage() below update the label without wiping
    // out the prepended <i> icon the way reassigning .textContent would.
    const siteLinkTextNode = siteLink.lastChild;

    const testReportButton = document.createElement("button");
    testReportButton.type = "button";
    testReportButton.dataset.testid = "footer-test-report-link";
    testReportButton.textContent = "Test Report";
    Object.assign(testReportButton.style, {
      background: "transparent",
      border: "none",
      padding: "0",
      font: "inherit",
      color: "#38A29D",
      textDecoration: "underline",
      cursor: "pointer",
    });
    testReportButton.addEventListener("click", () => openTestReportModal(testReportButton));
    prependIcon(testReportButton, "fa-solid fa-clipboard-check");
    const testReportButtonTextNode = testReportButton.lastChild;

    const lintReportLink = document.createElement("a");
    lintReportLink.dataset.testid = "footer-lint-report-link";
    lintReportLink.href = "reports/lint/megalinter-report.html";
    lintReportLink.target = "_blank";
    lintReportLink.rel = "noopener noreferrer";
    lintReportLink.textContent = "Lint Report";
    Object.assign(lintReportLink.style, { color: "#38A29D" });
    prependIcon(lintReportLink, "fa-solid fa-broom");
    const lintReportLinkTextNode = lintReportLink.lastChild;

    const securityReportLink = document.createElement("a");
    securityReportLink.dataset.testid = "footer-security-report-link";
    securityReportLink.href = "reports/security/trivy.sarif";
    securityReportLink.target = "_blank";
    securityReportLink.rel = "noopener noreferrer";
    securityReportLink.textContent = "Security Scan Report";
    Object.assign(securityReportLink.style, { color: "#38A29D" });
    prependIcon(securityReportLink, "fa-solid fa-shield-halved");
    const securityReportLinkTextNode = securityReportLink.lastChild;

    const githubLink = createIconLink(
      "footer-github-link",
      "https://github.com/mekhal/aidlc-radio-calico",
      "GitHub",
      "fa-brands fa-github"
    );
    const githubLinkTextNode = githubLink.lastChild;
    const linkedinLink = createIconLink(
      "footer-linkedin-link",
      "https://www.linkedin.com/in/mekhalomlao/",
      "LinkedIn",
      "fa-brands fa-linkedin"
    );
    const linkedinLinkTextNode = linkedinLink.lastChild;

    linksRow.appendChild(siteLink);
    linksRow.appendChild(testReportButton);
    linksRow.appendChild(lintReportLink);
    linksRow.appendChild(securityReportLink);
    linksRow.appendChild(githubLink);
    linksRow.appendChild(linkedinLink);

    footerInner.appendChild(disclaimer);
    footerInner.appendChild(linksRow);
    footer.appendChild(footerInner);

    const status = document.createElement("p");
    status.textContent = "Status: loading";

    const audio = document.createElement("audio");

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.testid = "listen-button";
    button.textContent = "Listen Now";
    // AC2's "mint accent" is a ring around the button (`.listen-now-btn` in
    // styles.css) rather than a background recolor — background/hover here
    // stay Forest Green/Teal per the style guide's Buttons section, which
    // tests/hero-listen-now-control.test.js already asserts via
    // getComputedStyle.
    button.className = "listen-now-btn";
    Object.assign(button.style, {
      background: REST_BACKGROUND,
      color: "#FFFFFF",
      borderRadius: "4px",
      border: "none",
      padding: "0.75rem 1.5rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      cursor: "pointer",
    });

    const liveIndicator = document.createElement("span");
    liveIndicator.dataset.testid = "live-indicator";
    liveIndicator.textContent = "LIVE";
    liveIndicator.hidden = true;
    Object.assign(liveIndicator.style, {
      marginLeft: "0.75rem",
      color: "#EFA63C",
      fontWeight: "700",
      letterSpacing: "0.05em",
    });

    const bufferingIndicator = document.createElement("p");
    bufferingIndicator.dataset.testid = "buffering-indicator";
    bufferingIndicator.textContent = "Buffering…";
    bufferingIndicator.hidden = true;
    Object.assign(bufferingIndicator.style, {
      color: "#231F20",
      fontSize: "0.875rem",
    });

    const errorMessage = document.createElement("p");
    errorMessage.dataset.testid = "error-message";
    errorMessage.textContent = "Playback error — the stream stopped unexpectedly.";
    errorMessage.hidden = true;
    Object.assign(errorMessage.style, {
      color: "#231F20",
    });

    const refreshButton = document.createElement("button");
    refreshButton.type = "button";
    refreshButton.dataset.testid = "refresh-button";
    refreshButton.textContent = "Refresh";
    refreshButton.hidden = true;
    Object.assign(refreshButton.style, {
      background: "transparent",
      color: REST_BACKGROUND,
      border: `2px solid ${REST_BACKGROUND}`,
      borderRadius: "4px",
      padding: "0.5rem 1rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      cursor: "pointer",
    });
    refreshButton.addEventListener("click", () => {
      window.location.reload();
    });

    function showFatalError() {
      liveIndicator.hidden = true;
      bufferingIndicator.hidden = true;
      errorMessage.hidden = false;
      if (!refreshButton.isConnected) heroSection.appendChild(refreshButton);
      refreshButton.hidden = false;
    }

    audio.addEventListener("playing", () => {
      liveIndicator.hidden = false;
      bufferingIndicator.hidden = true;
    });
    audio.addEventListener("pause", () => {
      liveIndicator.hidden = true;
    });
    audio.addEventListener("waiting", () => {
      bufferingIndicator.hidden = false;
    });

    let isPlaying = false;

    function togglePlayback() {
      const t = TRANSLATIONS && TRANSLATIONS[currentLanguage];
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        button.textContent = t ? t.listenNow : "Listen Now";
      } else {
        audio.play();
        isPlaying = true;
        button.textContent = t ? t.pause : "Pause";
      }
    }

    button.addEventListener("click", togglePlayback);
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        togglePlayback();
      }
    });
    button.addEventListener("mouseenter", () => {
      button.style.background = HOVER_BACKGROUND;
    });
    button.addEventListener("mouseleave", () => {
      button.style.background = REST_BACKGROUND;
    });

    // Mirrors the English default text hardcoded into `status` above, so
    // status updates that land before the i18n fetch resolves (a real race,
    // not just a theoretical one — HLS/audio events can fire before two
    // same-origin JSON fetches complete) still show the right English word
    // instead of leaving stale "loading" text on screen.
    const STATUS_FALLBACK_EN = {
      statusLoading: "Status: loading",
      statusReady: "Status: ready",
      statusError: "Status: error",
      statusUnsupported: "Status: unsupported",
    };

    function setStatus(key) {
      currentStatusKey = key;
      const t = TRANSLATIONS && TRANSLATIONS[currentLanguage];
      status.textContent = t ? t[key] : STATUS_FALLBACK_EN[key];
    }

    // Ticket C (issue #101), AC3: re-renders every user-facing string from
    // TRANSLATIONS[lang] once the i18n fetch has resolved (a no-op before
    // that, guarded above in toggleLanguage()/setStatus()/togglePlayback()),
    // looking up state-dependent text (play/pause, current status) by
    // current app state rather than hardcoding it, so a language switch
    // mid-playback still shows the right word. Called once translations
    // finish loading below to apply the language restored from localStorage
    // (or the "en" default) to the already-built DOM, and again on every
    // language-toggle click.
    function applyLanguage(lang) {
      if (!TRANSLATIONS) return;
      currentLanguage = lang;
      const t = TRANSLATIONS[lang];
      document.documentElement.lang = lang;

      heading.textContent = t.heading;
      brandText.textContent = t.heading;

      button.textContent = isPlaying ? t.pause : t.listenNow;
      status.textContent = t[currentStatusKey];
      liveIndicator.textContent = t.live;
      bufferingIndicator.textContent = t.buffering;
      errorMessage.textContent = t.errorMessage;
      refreshButton.textContent = t.refresh;

      themeToggle.setAttribute("aria-label", t.themeToggleAriaLabel);
      themeSwitch.offLabel.textContent = t.themeLabelLight;
      themeSwitch.onLabel.textContent = t.themeLabelDark;

      langToggle.setAttribute("aria-label", t.languageToggleAriaLabel);

      disclaimer.textContent = t.footerDisclaimer;
      siteLinkTextNode.data = t.footerSiteLink;
      testReportButtonTextNode.data = t.footerTestReport;
      lintReportLinkTextNode.data = t.footerLintReport;
      securityReportLinkTextNode.data = t.footerSecurityReport;
      githubLinkTextNode.data = t.footerGithub;
      githubLink.title = t.footerGithub;
      linkedinLinkTextNode.data = t.footerLinkedin;
      linkedinLink.title = t.footerLinkedin;
    }

    // Ticket B (issue #100), AC2: Bootstrap 4 Cover structure — nav bar,
    // then a centered hero that grows to fill remaining height, then the
    // footer, all inside a max-width/flex-column wrapper (`.site-wrapper` /
    // `.hero`, see styles.css).
    const heroSection = document.createElement("main");
    heroSection.className = "hero";
    heroSection.appendChild(heading);
    heroSection.appendChild(status);
    heroSection.appendChild(button);
    heroSection.appendChild(liveIndicator);
    heroSection.appendChild(bufferingIndicator);
    heroSection.appendChild(errorMessage);
    heroSection.appendChild(audio);

    const siteWrapper = document.createElement("div");
    siteWrapper.className = "site-wrapper";
    siteWrapper.appendChild(navBar);
    siteWrapper.appendChild(heroSection);
    siteWrapper.appendChild(footer);

    root.appendChild(siteWrapper);

    // Ticket C (issue #101), AC6: fetches i18n/en.json + i18n/th.json, then
    // re-renders the language restored from localStorage (or the "en"
    // default, a no-op) across the DOM just built above (AC3). Exposed as a
    // named promise so tests can deterministically await it instead of
    // racing an arbitrary number of ticks against the fetch.
    window.__i18nReady = loadTranslations().then((data) => {
      TRANSLATIONS = data;
      applyLanguage(currentLanguage);
    });

    let hls;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(STREAM_URL);
      hls.attachMedia(audio);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        setStatus("statusReady");
      });
      hls.on(window.Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setStatus("statusError");
          showFatalError();
        }
      });
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari has native HLS support
      audio.src = STREAM_URL;
      audio.addEventListener("loadedmetadata", () => {
        setStatus("statusReady");
      });
      audio.addEventListener("error", () => {
        setStatus("statusError");
        showFatalError();
      });
    } else {
      setStatus("statusUnsupported");
    }
  }

  initApp();
})();
