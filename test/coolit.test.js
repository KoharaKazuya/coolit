const {
  coolit,
  animationFrameMind,
  intervalMind,
  throttleMind
} = require("../dist/coolit.umd");

const timeoutRunner = async (iter, timeout) => {
  let running = true;
  setTimeout(() => {
    running = false;
  }, timeout);
  for await (const _ of iter) {
    if (!running) break;
  }
};

describe("README Example", () => {
  test("Bloking Style with ES2018 Async Iterators", async () => {
    let sum = 0;
    for await (const i of coolit([1, 2, 3, 4, 5])) {
      sum += i;
    }
    expect(sum).toBe(15);
  });

  test("Bloking Style without ES2018 Async Iterators", async () => {
    let sum = 0;
    const iter = coolit([1, 2, 3, 4, 5]);
    for (;;) {
      const { value: i, done } = await iter.next();
      if (done) break;
      // heavy task
      sum += i;
    }
    expect(sum).toBe(15);
  });

  test("Callback Style with ES2018 Async Iterators", async () => {
    let sum = 0;
    function* heavyTask() {
      for (const i of [1, 2, 3, 4, 5]) {
        yield;
        sum += i;
      }
    }
    for await (const _ of coolit(heavyTask())) {
    }
    expect(sum).toBe(15);
  });
});

describe("Coolit Engine", () => {
  test("coolit() is an AsyncIterable", async () => {
    expect(typeof coolit()[Symbol.asyncIterator]).toBe("function");
  });

  test("coolit default endless runner", async () => {
    let count = 0;
    await timeoutRunner(
      (async function*() {
        for await (const _ of coolit()) {
          count++;
          yield;
        }
      })(),
      1000
    );
    expect(count).toBeGreaterThan(10);
  });

  test("coolit prevents excessive call", async () => {
    let count = 0;
    await timeoutRunner(
      coolit(
        (function*() {
          for (;;) {
            count++;
            yield;
          }
        })()
      ),
      100
    );
    expect(count).toBeLessThan(100);
  });

  test("coolit can be used by the blocking style", async () => {
    let sum = 0;
    for await (const n of coolit([1, 2, 3, 4, 5])) {
      sum += n;
    }
    expect(sum).toBe(15);
  });

  test("coolit can be used by the callback style", async () => {
    let sum = 0;
    const runner = coolit(
      (function*() {
        let i = 1;
        while (i <= 5) {
          sum += i++;
        }
      })()
    );
    for await (const _ of runner) {
    }
    expect(sum).toBe(15);
  });
});

describe("Coolit Mind", () => {
  describe("idleMind", () => {});

  describe("animationFrameMind", () => {
    test("animationFrameMind has blank time", async () => {
      let count = 0;
      await timeoutRunner(
        coolit(
          (function*() {
            for (;;) {
              count++;
              yield;
            }
          })(),
          { mind: animationFrameMind() }
        ),
        1000
      );
      expect(count).toBeGreaterThan(10);
      expect(count).toBeLessThan(150);
    });
  });

  describe("intervalMind", () => {
    test("intervalMind has blank time", async () => {
      let count = 0;
      await timeoutRunner(
        coolit(
          (function*() {
            for (;;) {
              count++;
              yield;
            }
          })(),
          { mind: intervalMind(100) }
        ),
        1000
      );
      expect(count).toBeGreaterThan(8);
      expect(count).toBeLessThan(12);
    });

    test("intervalMind never be affected task time", async () => {
      let count = 0;
      await timeoutRunner(
        coolit(
          (async function*() {
            for (;;) {
              count++;
              await new Promise(r => setTimeout(r, 100));
              yield;
            }
          })(),
          { mind: intervalMind(100) }
        ),
        1000
      );
      expect(count).toBeGreaterThan(3);
      expect(count).toBeLessThan(7);
    });
  });

  describe("throttleMind", () => {
    test("throttleMind has blank time", async () => {
      let count = 0;
      await timeoutRunner(
        coolit(
          (function*() {
            for (;;) {
              count++;
              yield;
            }
          })(),
          { mind: throttleMind(100) }
        ),
        1000
      );
      expect(count).toBeGreaterThan(8);
      expect(count).toBeLessThan(12);
    });

    test("throttleMind be affected task time", async () => {
      let count = 0;
      await timeoutRunner(
        coolit(
          (async function*() {
            for (;;) {
              count++;
              await new Promise(r => setTimeout(r, 100));
              yield;
            }
          })(),
          { mind: throttleMind(100) }
        ),
        1000
      );
      expect(count).toBeGreaterThan(8);
      expect(count).toBeLessThan(12);
    });
  });
});
