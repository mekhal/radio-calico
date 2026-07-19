(function () {
  const STREAM_URL = "https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8";

  const REST_BACKGROUND = "#1F4E23";
  const HOVER_BACKGROUND = "#38A29D";

  const THEME_STYLE_ID = "radio-calico-theme-styles";
  // Issue #99 (Ticket A): footer is `position: fixed`, so body needs bottom
  // padding sized for the footer's (rough, pre-Ticket-B) two-row layout —
  // otherwise page content renders underneath it.
  const THEME_CSS = `
    [data-theme="dark"] body { background: #231F20; color: #FFFFFF; }
    [data-theme="light"] body { background: #F5EADA; color: #231F20; }
    body { padding-bottom: 5.5rem; }
    [data-theme="dark"] footer[data-testid="footer"] { background: transparent; color: #FFFFFF; }
    [data-theme="light"] footer[data-testid="footer"] { background: transparent; color: #1F4E23; }
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

  function initApp() {
    ensureThemeStyles();
    setTheme("dark");

    // Prefer the root tests/load-app.js's loadApp() hands us explicitly —
    // document.getElementById("root") resolves document-wide and would pick
    // up a live page's own #root instead (issue #54, bug 3).
    const root = window.__APP_ROOT__ || document.getElementById("root");

    const heading = document.createElement("h1");
    heading.textContent = "Radio Calico";

    // Not a <button> on purpose — Ticket A's tests assert exactly one
    // <button> exists (the Listen Now control), so the theme switch uses a
    // role="switch" div with equivalent keyboard support instead.
    const themeToggle = document.createElement("div");
    themeToggle.dataset.testid = "theme-toggle";
    themeToggle.setAttribute("role", "switch");
    themeToggle.setAttribute("tabindex", "0");
    themeToggle.setAttribute("aria-label", "Toggle dark/light theme");
    themeToggle.setAttribute("aria-checked", "false");
    themeToggle.textContent = "🌙 Dark";
    Object.assign(themeToggle.style, {
      display: "inline-block",
      background: "transparent",
      color: REST_BACKGROUND,
      border: `2px solid ${REST_BACKGROUND}`,
      borderRadius: "4px",
      padding: "0.5rem 1rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      cursor: "pointer",
    });

    function toggleTheme() {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const nextTheme = isDark ? "light" : "dark";
      setTheme(nextTheme);
      themeToggle.setAttribute("aria-checked", String(!isDark));
      themeToggle.textContent = nextTheme === "dark" ? "🌙 Dark" : "☀️ Light";
    }

    themeToggle.addEventListener("click", toggleTheme);
    themeToggle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        toggleTheme();
      }
    });

    // Issue #99 (Ticket A): footer is fixed to the viewport bottom, sized
    // down with a transparent background, and its content wrapped in a
    // centered container — a rough pass ahead of Ticket B's full layout.
    const footer = document.createElement("footer");
    footer.dataset.testid = "footer";
    Object.assign(footer.style, {
      position: "fixed",
      left: "0",
      right: "0",
      bottom: "0",
      padding: "0.5rem 1rem",
      fontSize: "0.8125rem",
    });

    const footerInner = document.createElement("div");
    Object.assign(footerInner.style, {
      maxWidth: "1200px",
      margin: "0 auto",
    });

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

    const lintReportLink = document.createElement("a");
    lintReportLink.dataset.testid = "footer-lint-report-link";
    lintReportLink.href = "reports/lint/megalinter-report.html";
    lintReportLink.target = "_blank";
    lintReportLink.rel = "noopener noreferrer";
    lintReportLink.textContent = "Lint Report";
    Object.assign(lintReportLink.style, { color: "#38A29D" });
    prependIcon(lintReportLink, "fa-solid fa-broom");

    const securityReportLink = document.createElement("a");
    securityReportLink.dataset.testid = "footer-security-report-link";
    securityReportLink.href = "reports/security/trivy.sarif";
    securityReportLink.target = "_blank";
    securityReportLink.rel = "noopener noreferrer";
    securityReportLink.textContent = "Security Scan Report";
    Object.assign(securityReportLink.style, { color: "#38A29D" });
    prependIcon(securityReportLink, "fa-solid fa-shield-halved");

    const githubLink = createIconLink(
      "footer-github-link",
      "https://github.com/mekhal/aidlc-radio-calico",
      "GitHub",
      "fa-brands fa-github"
    );
    const linkedinLink = createIconLink(
      "footer-linkedin-link",
      "https://www.linkedin.com/in/mekhalomlao/",
      "LinkedIn",
      "fa-brands fa-linkedin"
    );

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
      if (!refreshButton.isConnected) root.appendChild(refreshButton);
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
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        button.textContent = "Listen Now";
      } else {
        audio.play();
        isPlaying = true;
        button.textContent = "Pause";
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

    root.appendChild(heading);
    root.appendChild(themeToggle);
    root.appendChild(status);
    root.appendChild(button);
    root.appendChild(liveIndicator);
    root.appendChild(bufferingIndicator);
    root.appendChild(errorMessage);
    root.appendChild(audio);
    root.appendChild(footer);

    // AC2: the footer is `position: fixed`, so it's taken out of document
    // flow — body needs matching bottom padding or the fixed footer covers
    // page content (Listen Now button, theme toggle, live indicator).
    // Not wired to a `resize` listener: initApp() re-runs in the same live
    // document every time the footer's own Test Report button is clicked
    // (issue #41's in-DOM modal), and a `window`-level listener would leak
    // and keep referencing that earlier, by-then-detached footer.
    document.body.style.paddingBottom = `${footer.offsetHeight}px`;

    let hls;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(STREAM_URL);
      hls.attachMedia(audio);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        status.textContent = "Status: ready";
      });
      hls.on(window.Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          status.textContent = "Status: error";
          showFatalError();
        }
      });
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari has native HLS support
      audio.src = STREAM_URL;
      audio.addEventListener("loadedmetadata", () => {
        status.textContent = "Status: ready";
      });
      audio.addEventListener("error", () => {
        status.textContent = "Status: error";
        showFatalError();
      });
    } else {
      status.textContent = "Status: unsupported";
    }
  }

  initApp();
})();
