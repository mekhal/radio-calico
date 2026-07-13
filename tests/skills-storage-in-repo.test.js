/**
 * Issue #43: move skill storage into this repo instead of mekhal/claudeskill.
 * Doc-content assertions — this ticket has no app/DOM behavior, so the AC is
 * checked by fetching sibling repo files and asserting on their text instead
 * of exercising app.js. RED against the current CLAUDE.md/README.md/README.th.md
 * (they still name mekhal/claudeskill); the issue #43 Code PR makes these pass.
 *
 * Because this suite fetches files outside tests/ by relative path, it needs
 * tests/test-runner.html to be served over http(s) (a static file server) —
 * opening it via file:// fails these fetches in most browsers regardless of
 * the docs, since local-file fetch is blocked by file:// CORS policy.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;

  async function readRepoFile(relativePath) {
    const response = await fetch(relativePath);
    if (!response.ok) {
      throw new Error(`Expected to fetch ${relativePath}, got HTTP ${response.status}`);
    }
    return response.text();
  }

  describe("Skill storage lives in this repo, not mekhal/claudeskill (issue #43)", () => {
    it("CLAUDE.md no longer references the external claudeskill repo", async () => {
      const claudeMd = await readRepoFile("../CLAUDE.md");
      expect(claudeMd.includes("mekhal/claudeskill")).toBeFalsy();
    });

    it("CLAUDE.md documents skills as stored under this repo's own .claude/skills/<kebab-name>/SKILL.md", async () => {
      const claudeMd = await readRepoFile("../CLAUDE.md");
      expect(claudeMd.includes(".claude/skills/<kebab-name>/SKILL.md")).toBeTruthy();
    });

    it("CLAUDE.md's Adding a skill section documents the write-guard workaround", async () => {
      const claudeMd = await readRepoFile("../CLAUDE.md");
      const section = claudeMd.slice(claudeMd.indexOf("### Adding a skill"));
      expect(
        section.includes("write-guard") || section.includes("write guard")
      ).toBeTruthy();
      expect(section.toLowerCase().includes("human")).toBeTruthy();
    });

    it("CLAUDE.md's close flow lists only new-skill candidates surfaced by the issue's own work", async () => {
      const claudeMd = await readRepoFile("../CLAUDE.md");
      const section = claudeMd.slice(claudeMd.indexOf("### Adding a skill"));
      expect(section.toLowerCase().includes("surfaced by")).toBeTruthy();
    });

    it("README.md no longer references the external claudeskill repo", async () => {
      const readme = await readRepoFile("../README.md");
      expect(readme.includes("mekhal/claudeskill")).toBeFalsy();
    });

    it("README.md documents skills as stored in this repo's .claude/skills/", async () => {
      const readme = await readRepoFile("../README.md");
      expect(readme.includes(".claude/skills/")).toBeTruthy();
    });

    it("README.th.md no longer references the external claudeskill repo", async () => {
      const readmeTh = await readRepoFile("../README.th.md");
      expect(readmeTh.includes("mekhal/claudeskill")).toBeFalsy();
    });

    it("README.th.md documents skills as stored in this repo's .claude/skills/", async () => {
      const readmeTh = await readRepoFile("../README.th.md");
      expect(readmeTh.includes(".claude/skills/")).toBeTruthy();
    });

    it("a decision doc records why skill storage moved in-repo", async () => {
      const decisionDoc = await readRepoFile(
        "../docs/decisions/2026-07-13-skills-storage-move-in-repo.md"
      );
      expect(decisionDoc.trim().length).toBeGreaterThan(0);
    });
  });
})();
