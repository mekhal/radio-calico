/**
 * Minimal vanilla-JS test harness (no npm, no Jest) — see tests/README.md.
 * Loaded as a plain <script> global; exposes window.TestHarness.
 */
(function (global) {
  const results = [];
  const pending = [];
  let currentSuite = "";
  let queue = Promise.resolve();

  function describe(name, fn) {
    const previousSuite = currentSuite;
    currentSuite = previousSuite ? `${previousSuite} > ${name}` : name;
    fn();
    currentSuite = previousSuite;
  }

  function it(name, fn) {
    const fullName = currentSuite ? `${currentSuite} > ${name}` : name;
    const promise = queue.then(async () => {
      try {
        await fn();
        results.push({ name: fullName, passed: true });
      } catch (error) {
        results.push({
          name: fullName,
          passed: false,
          error: error && error.message ? error.message : String(error),
        });
      }
    });
    queue = promise;
    pending.push(promise);
    return promise;
  }

  function stringify(value) {
    try {
      return JSON.stringify(value);
    } catch (_e) {
      return String(value);
    }
  }

  function expect(actual) {
    return {
      toBe(expected) {
        if (actual !== expected) {
          throw new Error(`Expected ${stringify(actual)} to be ${stringify(expected)}`);
        }
      },
      toEqual(expected) {
        if (stringify(actual) !== stringify(expected)) {
          throw new Error(`Expected ${stringify(actual)} to equal ${stringify(expected)}`);
        }
      },
      toContain(expected) {
        if (!actual || !actual.includes(expected)) {
          throw new Error(`Expected ${stringify(actual)} to contain ${stringify(expected)}`);
        }
      },
      toBeTruthy() {
        if (!actual) throw new Error(`Expected ${stringify(actual)} to be truthy`);
      },
      toBeFalsy() {
        if (actual) throw new Error(`Expected ${stringify(actual)} to be falsy`);
      },
      toBeGreaterThan(expected) {
        if (!(actual > expected)) {
          throw new Error(`Expected ${stringify(actual)} to be greater than ${stringify(expected)}`);
        }
      },
    };
  }

  async function allSettled() {
    await Promise.all(pending);
  }

  global.TestHarness = {
    describe,
    it,
    expect,
    allSettled,
    getResults: () => results.slice(),
  };
})(window);
