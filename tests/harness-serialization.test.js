/**
 * Issue #40 (split from #38): tests/assert.js's it() must serialize test
 * execution — each it() only starts once the previous one has settled
 * (pass or fail). Today it() fires its async body immediately instead of
 * queuing on a promise chain, so this fails (RED). See tests/README.md.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  describe("assert.js it() serialization (issue #40)", () => {
    const order = [];

    it("a slower first test runs to completion", async () => {
      order.push("first:start");
      await wait(20);
      order.push("first:end");
    });

    it("a faster second test only starts after the first has settled", async () => {
      order.push("second:start");
      await wait(0);
      order.push("second:end");

      expect(order).toEqual(["first:start", "first:end", "second:start", "second:end"]);
    });
  });
})();
