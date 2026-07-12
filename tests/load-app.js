/**
 * Loads app.js (transformed the same way the browser does) into a fresh
 * #root element so each test starts from a clean mount. See tests/README.md.
 */
(function (global) {
  async function loadApp() {
    const previousRoot = document.getElementById("root");
    if (previousRoot) previousRoot.parentNode.removeChild(previousRoot);

    const root = document.createElement("div");
    root.id = "root";
    const fixtures = document.getElementById("fixtures") || document.body;
    fixtures.appendChild(root);

    const response = await fetch("../app.js");
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
  }

  global.AppTestHelpers = { loadApp, unloadApp };
})(window);
