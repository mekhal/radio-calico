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

  const NAV_LINKS = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#whats-this", label: "What's this" },
    { href: "#contact", label: "Contact" },
  ];

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

  function buildSidebar() {
    const aside = document.createElement("aside");
    aside.className = "chloe-sidebar";
    aside.setAttribute("aria-label", "Site footer links");

    const footerNav = document.createElement("nav");
    footerNav.className = "chloe-sidebar__icons";
    footerNav.setAttribute("aria-label", "Site links");
    FOOTER_LINKS.forEach((entry) => footerNav.appendChild(createIconLink({ ...entry, external: true })));

    const copy = document.createElement("p");
    copy.className = "chloe-sidebar__copy";
    copy.innerHTML = "&copy; 2026 Radio Calico. Released under the MIT License.";

    aside.appendChild(footerNav);
    aside.appendChild(copy);

    return aside;
  }

  function buildHeader() {
    const header = document.createElement("header");
    header.className = "chloe-header";

    const wordmark = document.createElement("span");
    wordmark.className = "chloe-wordmark";
    wordmark.textContent = "Radio Calico";

    const nav = document.createElement("nav");
    nav.className = "chloe-nav";
    nav.setAttribute("aria-label", "Primary");
    NAV_LINKS.forEach(({ href, label }) => {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      nav.appendChild(a);
    });

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

  function initAlbumPromo() {
    const root = document.getElementById("album-promo-root");
    if (!root) return;

    root.appendChild(buildSidebar());

    const page = document.createElement("div");
    page.className = "chloe-page";
    page.appendChild(buildHeader());
    page.appendChild(buildMain());
    root.appendChild(page);
  }

  initAlbumPromo();
})();
