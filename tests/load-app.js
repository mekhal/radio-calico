/**
 * Loads app.js (transformed the same way the browser does) into a fresh
 * #root element so each test starts from a clean mount. See tests/README.md.
 *
 * Issue #41: this file is also injected into the live index.html page by the
 * on-demand Test Report modal, which runs in the same document as a real
 * mounted app. loadApp() must never touch that live #root — it only ever
 * looks inside the *current* fixtures container (the last one added to the
 * document, so a container created after test-runner.html's static one takes
 * precedence), never document-wide.
 *
 * Issue #54 (bug 3): a live page's own #root (e.g. index.html's static
 * markup) sits earlier in the document than any fixtures container, so
 * app.js's initApp() can't just call document.getElementById("root") either —
 * that would resolve to the live root instead of the one created above.
 * loadApp() hands the root to initApp() explicitly via window.__APP_ROOT__.
 */
(function (global) {
  function currentFixturesContainer() {
    const containers = document.querySelectorAll('[id="fixtures"]');
    return containers.length ? containers[containers.length - 1] : document.body;
  }

  async function loadApp() {
    const fixtures = currentFixturesContainer();
    const previousRoot = fixtures.querySelector("#root");
    if (previousRoot) previousRoot.parentNode.removeChild(previousRoot);

    const root = document.createElement("div");
    root.id = "root";
    fixtures.appendChild(root);

    // Tell app.js's initApp() exactly which #root to mount into, since a live
    // page's own #root (e.g. index.html's static markup) would otherwise win
    // a document-wide getElementById lookup — see issue #54, bug 3.
    global.__APP_ROOT__ = root;

    const response = await fetch(global.__APP_JS_PATH__ || "../app.js");
    const source = await response.text();
    const transformed = window.Babel.transform(source, { presets: ["react"] }).code;

    const script = document.createElement("script");
    script.textContent = transformed;
    document.body.appendChild(script);
    document.body.removeChild(script);

    return root;
  }

  function unloadApp(root) {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    if (global.__APP_ROOT__ === root) global.__APP_ROOT__ = undefined;
  }

  global.AppTestHelpers = { loadApp, unloadApp };
})(window);
