import { wrapPromise, tick } from "../testing/tsUtils";

import { AbortError, promisify, waitFor } from "./util";

describe("promisify", () => {
  it.for([
    ["non-promise", 123],
    ["promise", Promise.resolve(123)],
  ])(
    "only requires single tick for %s",
    async ([_, maybePromise], { expect }) => {
      const promise = wrapPromise(
        promisify(
          // eslint-disable-next-line @typescript-eslint/promise-function-async
          () => maybePromise,
        ),
      );
      expect(promise.done).toBe(false);
      await tick();
      expect(promise.done).toBe(true);
    },
  );
});

describe("waitFor", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it.for([
    ["5 milliseconds", { milliseconds: 5 }, 5],
    ["3 seconds", { seconds: 3 }, 3_000],
    ["6 minutes", { minutes: 6 }, 360_000],
  ] as const)("waits for %s", async ([_, duration, expectedMs], { expect }) => {
    const promise = wrapPromise(waitFor(duration));
    await tick();
    expect(promise.done, "should initially be pending").toBe(false);
    await vi.advanceTimersByTimeAsync(expectedMs - 1);
    expect(promise.done, "should be pending immediately before target").toBe(
      false,
    );
    await vi.advanceTimersByTimeAsync(1);
    expect(promise.done, "should be resolved when target reached").toBe(true);
  });

  it.for([
    ["negative", -100],
    ["zero", 0],
  ] as const)(
    "immediately resolves if duration is %s",
    async ([_, duration], { expect }) => {
      const promise = wrapPromise(waitFor({ milliseconds: duration }));
      await tick();
      expect(promise.done).toBe(true);
    },
  );

  it("will cancel if signal aborts", async () => {
    const controller = new AbortController();
    const promise = waitFor({ minutes: 60 }, controller.signal);
    controller.abort();
    await expect(promise).rejects.toThrow(AbortError);
  });
});
