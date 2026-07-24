(function () {
  "use strict";

  // Mirrors app.js's footer `linksRow` (site link, Test/Lint/Security Report,
  // GitHub, LinkedIn) — see review decision on issue #155 (2026-07-24). This
  // is now the sidebar's only link group, replacing the social icons per the
  // follow-up review comment on PR #164 (2026-07-24). Test Report links
  // straight to the report page (tests/test-runner.html) rather than reusing
  // app.js's openTestReportModal in-page modal, since that modal drives
  // app.js's own TestHarness/test fixtures — logic this static landing page
  // doesn't load and has no use for; a direct link reaches the same report
  // without duplicating it.
  const FOOTER_LINKS = [
    {
      testid: "sidebar-footer-site-link",
      href: "https://www.radio-calico.com/",
      label: "radio-calico.com",
      icon: "bi-broadcast",
    },
    {
      testid: "sidebar-footer-test-report-link",
      href: "tests/test-runner.html",
      label: "Test Report",
      icon: "bi-clipboard-check",
    },
    {
      testid: "sidebar-footer-lint-report-link",
      href: "reports/lint/megalinter-report.html",
      label: "Lint Report",
      icon: "bi-brush",
    },
    {
      testid: "sidebar-footer-security-report-link",
      href: "reports/security/trivy.sarif",
      label: "Security Scan Report",
      icon: "bi-shield-check",
    },
    {
      testid: "sidebar-footer-github-link",
      href: "https://github.com/mekhal/aidlc-radio-calico",
      label: "GitHub",
      icon: "bi-github",
    },
    {
      testid: "sidebar-footer-linkedin-link",
      href: "https://www.linkedin.com/in/mekhalomlao/",
      label: "LinkedIn",
      icon: "bi-linkedin",
    },
  ];

  // Distinct localStorage keys from app.js's "radioCalicoLanguage" (see
  // app.js:39) — this page is standalone (AC6) and must not read/write the
  // main app's stored preferences even though both share an origin.
  const LANG_STORAGE_KEY = "chloeAlbumPromoLanguage";
  const THEME_STORAGE_KEY = "chloeAlbumPromoTheme";

  // Small self-contained copy set for this static page's own chrome — not
  // wired to app.js's i18n/*.json fetch pipeline, since that would pull the
  // main app's translation architecture into a page whose Test-PR waiver
  // rests on staying self-contained DOM construction (issue #155 review,
  // 2026-07-24).
  const TRANSLATIONS = {
    en: {
      nav: { home: "Home", about: "About", whatsThis: "What's this", contact: "Contact" },
      disclaimer: "Radio Calico is an independent internet radio stream. All music remains the property of its respective owners.",
      copyright: "&copy; 2026 Radio Calico. Released under the MIT License.",
      themeToggleLabel: "Toggle dark theme",
      langSelectLabel: "Language",
    },
    th: {
      nav: { home: "หน้าแรก", about: "เกี่ยวกับ", whatsThis: "คืออะไร", contact: "ติดต่อ" },
      disclaimer: "Radio Calico เป็นสถานีวิทยุอินเทอร์เน็ตอิสระ เพลงทั้งหมดยังคงเป็นทรัพย์สินของเจ้าของลิขสิทธิ์",
      copyright: "&copy; 2026 Radio Calico สงวนสิทธิ์ภายใต้สัญญาอนุญาต MIT",
      themeToggleLabel: "สลับธีมมืด/สว่าง",
      langSelectLabel: "ภาษา",
    },
  };

  const NAV_KEYS = ["home", "about", "whatsThis", "contact"];
  const NAV_HREFS = { home: "#home", about: "#about", whatsThis: "#whats-this", contact: "#contact" };

  function getStoredLanguage() {
    return window.localStorage.getItem(LANG_STORAGE_KEY) === "th" ? "th" : "en";
  }

  function getStoredTheme() {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  }

  function createIconLink({ testid, href, label, icon, external }) {
    const link = document.createElement("a");
    link.dataset.testid = testid;
    link.href = href;
    link.title = label;
    link.setAttribute("aria-label", label);
    if (external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    const iconEl = document.createElement("i");
    iconEl.className = `bi ${icon}`;
    iconEl.setAttribute("aria-hidden", "true");
    link.appendChild(iconEl);

    return link;
  }

  function buildThemeToggle(state) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chloe-sidebar__theme-btn";
    button.dataset.testid = "sidebar-theme-toggle";

    const iconEl = document.createElement("i");
    iconEl.setAttribute("aria-hidden", "true");

    function render() {
      const isDark = state.theme === "dark";
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", TRANSLATIONS[state.lang].themeToggleLabel);
      button.title = TRANSLATIONS[state.lang].themeToggleLabel;
      iconEl.className = `bi ${isDark ? "bi-sun-fill" : "bi-moon-stars-fill"}`;
    }

    button.appendChild(iconEl);
    button.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
      document.documentElement.setAttribute("data-chloe-theme", state.theme);
      render();
    });

    render();
    state.onLanguageChange.push(render);
    return button;
  }

  function buildLanguageSelect(state) {
    const select = document.createElement("select");
    select.className = "chloe-sidebar__lang-select";
    select.dataset.testid = "sidebar-language-select";

    ["en", "th"].forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang;
      option.textContent = lang.toUpperCase();
      select.appendChild(option);
    });

    function render() {
      select.value = state.lang;
      select.setAttribute("aria-label", TRANSLATIONS[state.lang].langSelectLabel);
    }

    select.value = state.lang;
    select.addEventListener("change", () => {
      state.lang = select.value === "th" ? "th" : "en";
      window.localStorage.setItem(LANG_STORAGE_KEY, state.lang);
      document.documentElement.lang = state.lang;
      state.onLanguageChange.forEach((fn) => fn());
    });

    render();
    state.onLanguageChange.push(render);
    return select;
  }

  function buildSidebar(state) {
    const aside = document.createElement("aside");
    aside.className = "chloe-sidebar";
    aside.setAttribute("aria-label", "Site footer links");

    const footerNav = document.createElement("nav");
    footerNav.className = "chloe-sidebar__icons";
    footerNav.setAttribute("aria-label", "Site links");
    FOOTER_LINKS.forEach((entry) => footerNav.appendChild(createIconLink({ ...entry, external: true })));

    const controls = document.createElement("div");
    controls.className = "chloe-sidebar__controls";
    controls.appendChild(buildThemeToggle(state));
    controls.appendChild(buildLanguageSelect(state));
    footerNav.appendChild(controls);

    aside.appendChild(footerNav);

    return aside;
  }

  function buildHeader(state) {
    const header = document.createElement("header");
    header.className = "chloe-header";

    const wordmark = document.createElement("span");
    wordmark.className = "chloe-wordmark";

    const logo = document.createElement("img");
    logo.className = "chloe-wordmark__logo";
    logo.src = "RadioCalicoStyle/RadioCalicoLogoTM.png";
    logo.alt = "Radio Calico logo";

    wordmark.appendChild(document.createTextNode("Radio"));
    wordmark.appendChild(logo);
    wordmark.appendChild(document.createTextNode("Calico"));

    const nav = document.createElement("nav");
    nav.className = "chloe-nav";
    nav.setAttribute("aria-label", "Primary");

    const navLinks = {};
    NAV_KEYS.forEach((key) => {
      const a = document.createElement("a");
      a.href = NAV_HREFS[key];
      navLinks[key] = a;
      nav.appendChild(a);
    });

    function render() {
      NAV_KEYS.forEach((key) => {
        navLinks[key].textContent = TRANSLATIONS[state.lang].nav[key];
      });
    }

    render();
    state.onLanguageChange.push(render);

    header.appendChild(wordmark);
    header.appendChild(nav);

    return header;
  }

  function buildMain() {
    const main = document.createElement("main");
    main.className = "chloe-main";
    // Hero, player card, and theme polish land in Tickets B/C/D/E.
    return main;
  }

  function buildFooter(state) {
    const footer = document.createElement("footer");
    footer.className = "chloe-footer";

    const disclaimer = document.createElement("p");
    disclaimer.className = "chloe-footer__disclaimer";

    const copy = document.createElement("p");
    copy.className = "chloe-footer__copy";

    function render() {
      disclaimer.textContent = TRANSLATIONS[state.lang].disclaimer;
      copy.innerHTML = TRANSLATIONS[state.lang].copyright;
    }

    render();
    state.onLanguageChange.push(render);

    footer.appendChild(disclaimer);
    footer.appendChild(copy);

    return footer;
  }

  function initAlbumPromo() {
    const root = document.getElementById("album-promo-root");
    if (!root) return;

    const state = { lang: getStoredLanguage(), theme: getStoredTheme(), onLanguageChange: [] };
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-chloe-theme", state.theme);

    root.appendChild(buildSidebar(state));

    const page = document.createElement("div");
    page.className = "chloe-page";
    page.appendChild(buildHeader(state));
    page.appendChild(buildMain());
    page.appendChild(buildFooter(state));
    root.appendChild(page);
  }

  initAlbumPromo();
})();
