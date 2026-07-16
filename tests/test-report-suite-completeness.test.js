/**
 * Issue #67, AC2: the footer's on-demand Test Report modal (app.js) was
 * scoped down to only app.js's own HTML/DOM interface-function tests —
 * tests/harness-serialization.test.js (tests the assert.js harness itself)
 * and tests/skills-storage-in-repo.test.js (doc-content assertions, no
 * app/DOM behavior) no longer belong there. This supersedes the original
 * issue #54 version of this file, which asserted the opposite (that the
 * modal's injected suite fetches skills-storage-in-repo.test.js) — that was
 * the fix for those two files never running anywhere at all. They still need
 * to run somewhere, so this now asserts they're wired directly into
 * tests/test-runner.html's script list instead of the modal's scoped suite.
 *
 * Note: like the original version, this file itself opens the Test Report
 * modal, so it stays self-referential — excluded from
 * tests/test-report-suite-files.js and wired only into tests/test-runner.html
 * (see the comment there).
 */
(function () {
  const { describe, it, expect } = window.TestHarness;

  async function readOwnPage() {
    const response = await fetch("test-runner.html");
    if (!response.ok) {
      throw new Error(`Expected to fetch test-runner.html, got HTTP ${response.status}`);
    }
    return response.text();
  }

  describe("Test Report modal scoping (issue #67, AC2)", () => {
    it("excludes non-interface-function tests from the modal's scoped suite", () => {
      expect(window.TEST_REPORT_SUITE_FILES.includes("harness-serialization.test.js")).toBeFalsy();
      expect(window.TEST_REPORT_SUITE_FILES.includes("skills-storage-in-repo.test.js")).toBeFalsy();
    });

    it("still wires harness-serialization.test.js directly into test-runner.html", async () => {
      const html = await readOwnPage();
      expect(html.includes('<script src="harness-serialization.test.js"></script>')).toBeTruthy();
    });

    it("still wires skills-storage-in-repo.test.js directly into test-runner.html", async () => {
      const html = await readOwnPage();
      expect(html.includes('<script src="skills-storage-in-repo.test.js"></script>')).toBeTruthy();
    });
  });
})();
