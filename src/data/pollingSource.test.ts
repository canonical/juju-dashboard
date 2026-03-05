import type { MockedFunction } from "vitest";

import {
  createPollingSource,
  type PollConfig,
  PollControllerManager,
  type PollFn,
} from "./pollingSource";
import { SourceState, type Source } from "./source";
import { tick } from "./testUtils";

/**
 * Function signature for `setup` function in the test harness.
 */
type SetupFn = (params?: {
  /**
   * Additional configuration to provide to the source upon creation.
   */
  config?: Partial<PollConfig>;
  /**
   * Seed the source with some pre-configured events. Once no more seeded items are available,
   * promises will continue to be produced.
   */
  seed?: (
    | { reject: unknown }
    | { resolve: number }
    | { return: number }
    | { throw: unknown }
  )[];
}) => Promise<{
  source: Source<number>;
  pollFn: MockedFunction<PollFn<number>>;
}>;

type HarnessParams = {
  /**
   * Setup a new source.
   *
   * The created source will have a poll function which constantly returns unresolved promises. The
   * promises can be resolved or rejected using the `resolve` and `reject` helper.
   */
  setup: SetupFn;
  /**
   * Get the abort signal corresponding with `callNumber`.
   */
  getSignal: (callNumber: number) => AbortSignal;
  /**
   * Resolve the promise corresponding with `callNumber`.
   */
  resolve: (callNumber: number, data: number) => Promise<void>;
  /**
   * Reject the promise corresponding with `callNumber`.
   */
  reject: (callNumber: number, error: unknown) => Promise<void>;
};

/**
 * Test harness for testing `createPollingSource`. This harness ensures that the source is
 * correctly setup, allows for unlimited polling with controls for determining when a given poll
 * function is resolved, and correctly cleans up resources to prevent memory leaks.
 */
function harness<T extends unknown[]>(
  cb: (params: HarnessParams, ...args: T) => Promise<void>,
) {
  return async (...args: T): Promise<void> => {
    // Track all created promises, so they can be cleaned up later.
    const promises: PromiseWithResolvers<number>[] = [];
    let seedCount = 0;

    // Allow for hoisting `source` and `pollFn` once they're created.
    let source = null as null | Source<number>;
    let pollFn = null as Awaited<ReturnType<SetupFn>>["pollFn"] | null;

    // Function which will create a new `source`.
    const setup: SetupFn = async ({ seed, config } = {}) => {
      if (source !== null) {
        throw new Error("setup called multiple times");
      }

      // Track how many seeded events were provided.
      seedCount = seed?.length ?? 0;

      // Create the `pollFn` mock.
      pollFn = vi.fn().mockImplementation(
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        () => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const callNumber = pollFn!.mock.calls.length - 1;
          if (seed && callNumber < seed.length) {
            // This call corresponds with a provided seed item, so produce it.
            const item = seed[callNumber];
            if ("resolve" in item) {
              return Promise.resolve(item.resolve);
            } else if ("return" in item) {
              return item.return;
            } else if ("throw" in item) {
              throw item.throw;
            } else if ("reject" in item) {
              return Promise.reject(item.reject);
            }
          }

          // Create a new promise, save it, and return it.
          const promise = Promise.withResolvers<number>();
          promises.push(promise);
          return promise.promise;
        },
      );

      source = createPollingSource(
        pollFn,
        Object.assign({ interval: { seconds: 1 } }, config ?? {}),
      );

      // Allow for the first poll to be called.
      await tick();

      return { source, pollFn };
    };

    // Get the signal for a given call. This relies on the call tracking provided by the `pollFn`
    // mock.
    const getSignal = (callNumber: number): AbortSignal => {
      const call = pollFn?.mock.calls[callNumber];
      if (!call) {
        throw new Error(`Call ${callNumber} does not exist`);
      }

      // Abort signal is the first parameter of the `pollFn`.
      const [abortSignal] = call;
      return abortSignal;
    };

    // Fetch the `PromiseWithResolvers` for a given call.
    const getPromiseResolvers = (
      callNumber: number,
    ): PromiseWithResolvers<number> => {
      const promiseNumber = callNumber - seedCount;
      const promise = promises[promiseNumber];
      if (!promise) {
        throw new Error(`Promise ${promiseNumber} does not exist`);
      }
      return promise;
    };

    // Resolve the promise for a given call.
    const resolve = async (callNumber: number, data: number): Promise<void> => {
      getPromiseResolvers(callNumber).resolve(data);
    };

    // Reject the promise for a given call.
    const reject = async (
      callNumber: number,
      error: unknown,
    ): Promise<void> => {
      getPromiseResolvers(callNumber).reject(error);
    };

    // Run the test.
    await cb({ setup, getSignal, resolve, reject }, ...args);

    // Clean up.
    source?.done();
    for (const promise of promises) {
      promise.reject();
    }
  };
}

describe("createPollingSource", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("setup", () => {
    it(
      "immediately calls poll function",
      harness(async ({ setup }) => {
        const { pollFn } = await setup();
        expect(pollFn).toHaveBeenCalledTimes(1);
      }),
    );

    it.for([
      ["non-async", { return: 1 }],
      ["async", { resolve: 1 }],
    ] as const)(
      "handles %s poll function",
      harness(async ({ setup }, [_, seed], { expect }) => {
        const { source } = await setup({ seed: [seed] });
        expect(source.data).toBe(1);
      }),
    );

    it(
      "handles poll function which immediately throws an error",
      harness(async ({ setup }) => {
        const error = new Error("an error");
        const { source, pollFn } = await setup({
          seed: [{ reject: error }, { resolve: 123 }],
        });

        expect(pollFn).toBeCalledTimes(1);
        expect(source.state).toBe(SourceState.Error);
        expect(source.error?.source).toEqual(error);

        await vi.advanceTimersByTimeAsync(1000);
        expect(pollFn).toBeCalledTimes(2);
        expect(source.state).toBe(SourceState.Valid);
        expect(source.data).toBe(123);
        expect(source.error).toBe(null);
      }),
    );
  });

  describe("polling", () => {
    it(
      "continually calls poll function",
      harness(async ({ setup }) => {
        const { pollFn, source } = await setup({
          seed: new Array(5).fill(null).map((_, i) => ({ resolve: i })),
        });

        for (let i = 0; i < 5; i++) {
          expect(pollFn).toBeCalledTimes(i + 1);
          expect(source.data).toEqual(i);
          expect(source.loading).toBe(false);

          // Partially advance timers.
          await vi.advanceTimersByTimeAsync(999);
          expect(pollFn).toBeCalledTimes(i + 1);
          expect(source.loading).toBe(false);

          // Advance remaining duration, ready for next loop.
          await vi.advanceTimersByTimeAsync(1);
        }
      }),
    );

    describe("source done", () => {
      it(
        "stops polling",
        harness(async ({ setup }) => {
          const { pollFn, source } = await setup();

          // Source should be polled as normal.
          expect(pollFn).toBeCalledTimes(1);
          await vi.advanceTimersByTimeAsync(1000);
          expect(pollFn).toBeCalledTimes(2);

          // Source marked as done.
          source.done();

          // Poll function should never be called again, no matter how long is waited.
          await vi.advanceTimersByTimeAsync(5000);
          expect(pollFn).toBeCalledTimes(2);
        }),
      );

      it(
        "aborts in progress polls",
        harness(async ({ setup, getSignal }) => {
          const { pollFn, source } = await setup();

          // Source should be polled.
          expect(pollFn).toBeCalledTimes(1);
          expect(getSignal(0).aborted).toBe(false);

          // Source marked as done.
          source.done();

          expect(getSignal(0).aborted).toBe(true);
        }),
      );
    });

    describe("slow poll function", () => {
      it(
        "calls next poll function while waiting",
        harness(async ({ setup, resolve }) => {
          const { pollFn, source } = await setup();

          // Initially, poll function should be called and source should be loading.
          expect(pollFn).toHaveBeenCalledTimes(1);
          expect(source.loading).toBe(true);
          expect(source.data).toBe(null);

          // Even though poll hasn't completed, next poll function should be called.
          await vi.advanceTimersByTimeAsync(1000);
          expect(pollFn).toHaveBeenCalledTimes(2);

          // Immediately resolve second promise.
          await resolve(1, 123);

          // Since second poll function has resolved, source should reflect that data.
          expect(source.loading).toBe(false);
          expect(source.data).toBe(123);
        }),
      );

      it(
        "ignores if it succeeds",
        harness(async ({ setup, resolve }) => {
          const { pollFn, source } = await setup();

          // Initially, poll function should be called and source should be loading.
          expect(pollFn).toHaveBeenCalledTimes(1);
          expect(source.loading).toBe(true);
          expect(source.data).toBe(null);

          // Trigger the second poll.
          await vi.advanceTimersByTimeAsync(1000);
          expect(pollFn).toHaveBeenCalledTimes(2);
          // Resolve it.
          await resolve(1, 123);
          expect(source.loading).toBe(false);
          expect(source.data).toBe(123);

          // Resolve first poll, and ensure it's data was ignored.
          await resolve(0, 456);
          expect(source.data).toBe(123);
        }),
      );

      it(
        "aborts slow poll function if newer one succeeds",
        harness(async ({ setup, resolve, getSignal }) => {
          const { pollFn } = await setup();

          // Extract the signal given to the first call.
          expect(getSignal(0).aborted).toBe(false);

          // Allow the second poll to succeed.
          await vi.advanceTimersByTimeAsync(1000);
          expect(pollFn).toHaveBeenCalledTimes(2);
          await resolve(1, 123);

          // First poll should've been aborted.
          expect(getSignal(0).aborted).toBe(true);
        }),
      );

      it(
        "immediately aborts incomplete request when `tailRequests` = 0",
        harness(async ({ setup, getSignal }) => {
          const { pollFn } = await setup({ config: { tailRequests: 0 } });

          await vi.advanceTimersByTimeAsync(1000);
          expect(pollFn).toBeCalledTimes(2);
          expect(getSignal(0).aborted).toBe(true);
          expect(getSignal(1).aborted).toBe(false);

          await vi.advanceTimersByTimeAsync(1000);
          expect(pollFn).toBeCalledTimes(3);
          expect(getSignal(1).aborted).toBe(true);
          expect(getSignal(2).aborted).toBe(false);

          await vi.advanceTimersByTimeAsync(1000);
          expect(pollFn).toBeCalledTimes(4);
          expect(getSignal(2).aborted).toBe(true);
          expect(getSignal(3).aborted).toBe(false);
        }),
      );

      it.for([[3], [5], [1]] as const)(
        "retains incomplete requests when `tailRequests` = %i",
        harness(async ({ setup, getSignal }, [tailRequests], { expect }) => {
          const { pollFn } = await setup({ config: { tailRequests } });

          // Advance to start `tailRequests + 1` requests
          await vi.advanceTimersByTimeAsync(1000 * tailRequests);
          expect(pollFn).toBeCalledTimes(tailRequests + 1);

          // Nothing should be aborted yet.
          for (let i = 0; i <= tailRequests; i++) {
            expect(getSignal(i).aborted).toBe(false);
          }

          // Advance by 1 second to start one more poll.
          await vi.advanceTimersByTimeAsync(1000);
          expect(pollFn).toBeCalledTimes(tailRequests + 2);

          // First signal should be aborted.
          expect(getSignal(0).aborted).toBe(true);

          // Next `tailRequests + 1` signals should be active.
          for (let i = 1; i <= tailRequests + 1; i++) {
            expect(getSignal(i).aborted).toBe(false);
          }
        }),
      );
    });

    describe("fallback data", () => {
      it(
        "uses older data if newer poll fails",
        harness(async ({ setup }) => {
          const { source } = await setup({
            seed: [{ resolve: 123 }, { reject: new Error() }],
          });

          // Should have initial data.
          expect(source.state).toEqual(SourceState.Valid);
          expect(source.data).toEqual(123);
          expect(source.loading).toBe(false);

          await vi.advanceTimersByTimeAsync(1000);

          // Should show error.
          expect(source.state).toEqual(SourceState.Error);
          expect(source.error).not.toBe(null);
          // Should retain initial data.
          expect(source.data).toEqual(123);
          expect(source.loading).toBe(false);
        }),
      );

      it(
        "waits for older data if newer poll fails",
        harness(async ({ setup, resolve, reject }) => {
          const { pollFn, source } = await setup();

          // Poll function should've been called, and source should be loading.
          expect(pollFn).toHaveBeenCalledTimes(1);
          expect(source.loading).toBe(true);

          // Advance to when the next poll is due.
          await vi.advanceTimersByTimeAsync(1000);
          expect(pollFn).toHaveBeenCalledTimes(2);
          // Source should show error.
          await reject(1, new Error());
          expect(source.data).toBe(null);
          expect(source.loading).toBe(false);
          expect(source.state).toBe(SourceState.Error);

          // Resolve the old poll function.
          await resolve(0, 123);
          // Source should include data, while showing error.
          expect(source.data).toEqual(123);
          expect(source.loading).toBe(false);
          expect(source.state).toBe(SourceState.Error);
        }),
      );
    });

    describe("refetch", () => {
      it(
        "immediately triggers a poll when invalidated",
        harness(async ({ setup, resolve }) => {
          const { source, pollFn } = await setup({
            config: { ignoreRefetch: false },
          });

          await resolve(0, 123);

          expect(pollFn).toBeCalledTimes(1);

          // Partially advance.
          await vi.advanceTimersByTimeAsync(500);
          expect(pollFn).toBeCalledTimes(1);

          source.invalidate();
          // Signal propagating.
          await tick();
          // Trigger next poll.
          await tick();
          expect(pollFn).toBeCalledTimes(2);

          expect(source.state).toBe(SourceState.Stale);
          expect(source.loading).toBe(true);

          await resolve(1, 456);

          // Advance to 1s total, which shouldn't have an additional poll.
          await vi.advanceTimersByTimeAsync(500);
          expect(pollFn).toBeCalledTimes(2);

          expect(source.state).toBe(SourceState.Valid);
          expect(source.loading).toBe(false);

          // Additional poll should take place at 1.5s
          await vi.advanceTimersByTimeAsync(500);
          expect(pollFn).toBeCalledTimes(3);
        }),
      );

      it(
        "does not trigger a poll if `ignoreRefetch` is set",
        harness(async ({ setup, resolve }) => {
          const { source, pollFn } = await setup({
            config: { ignoreRefetch: true },
          });

          await resolve(0, 123);

          expect(pollFn).toBeCalledTimes(1);

          // Advance before invalidating.
          await vi.advanceTimersByTimeAsync(500);

          source.invalidate();
          // Signal propagating.
          await tick();
          // Trigger next poll.
          await tick();

          expect(source.state).toBe(SourceState.Stale);
          expect(source.loading).toBe(false);

          // Invalidation should be ignored.
          expect(pollFn).toBeCalledTimes(1);

          // Timer should continue as usual.
          await vi.advanceTimersByTimeAsync(500);
          expect(pollFn).toBeCalledTimes(2);
        }),
      );
    });
  });

  describe("`Source` interface", () => {
    it(
      "sets loading state aligned with poll functions",
      harness(async ({ setup, resolve }) => {
        const { source } = await setup();

        expect(source.loading).toBe(true);

        await resolve(0, 123);
        expect(source.loading).toBe(false);

        await vi.advanceTimersByTimeAsync(1000);
        expect(source.loading).toBe(true);
      }),
    );

    it(
      "updates `data` with latest available data",
      harness(async ({ setup, resolve }) => {
        const { source } = await setup();

        expect(source.data).toBe(null);
        await resolve(0, 123);
        expect(source.data).toBe(123);

        await vi.advanceTimersByTimeAsync(1000);
        await resolve(1, 456);
        expect(source.data).toBe(456);
      }),
    );

    describe("error", () => {
      it(
        "displays error",
        harness(async ({ setup, reject }) => {
          const { source } = await setup();

          expect(source.error).toBe(null);

          const error = new Error("An error.");
          await reject(0, error);
          expect(source.error?.source).toBe(error);

          // Error should still be present while next poll is pending.
          await vi.advanceTimersByTimeAsync(1000);
          expect(source.state).toBe(SourceState.Error);
          expect(source.loading).toBe(true);
          expect(source.error?.source).toBe(error);
        }),
      );

      it(
        "clears error after successful load",
        harness(async ({ setup, resolve, reject }) => {
          const { source } = await setup();

          const error = new Error("An error.");
          await reject(0, error);
          await vi.advanceTimersByTimeAsync(1000);
          expect(source.state).toBe(SourceState.Error);
          expect(source.error?.source).toBe(error);

          await resolve(1, 123);
          expect(source.state).toBe(SourceState.Valid);
          expect(source.error).toBe(null);
        }),
      );
    });
  });
});

describe("PollControllerManager", () => {
  describe("tailUntilIndex", () => {
    it.for([
      [-1, 10],
      [0, 10],
      [1, 9],
      [3, 7],
      [5, 5],
      [10, 0],
      [11, 0],
    ] as const)(
      "index %i tails %i items",
      ([i, expectedRemaining], { expect }) => {
        const manager = new PollControllerManager();
        const controllers = new Array(10)
          .fill(null)
          .map(() => manager.create());

        manager.tailUntilIndex(i);
        expect(
          controllers
            .slice(0, 10 - expectedRemaining)
            .every((controller) => controller.signal.aborted),
        ).toBe(true);
        expect(
          controllers
            .slice(10 - expectedRemaining)
            .every((controller) => !controller.signal.aborted),
        ).toBe(true);
      },
    );
  });

  describe("tail", () => {
    it.for([
      [-1, 0],
      [0, 0],
      [1, 1],
      [3, 3],
      [5, 5],
      [10, 10],
      [11, 10],
    ] as const)(
      "%i tails %i items",
      ([count, expectedRemaining], { expect }) => {
        const manager = new PollControllerManager();
        const controllers = new Array(10)
          .fill(null)
          .map(() => manager.create());

        manager.tail(count);
        expect(
          controllers
            .slice(0, 10 - expectedRemaining)
            .every((controller) => controller.signal.aborted),
        ).toBe(true);
        expect(
          controllers
            .slice(10 - expectedRemaining)
            .every((controller) => !controller.signal.aborted),
        ).toBe(true);
      },
    );

    describe("tailUntil", () => {
      it("aborts everything before controller", () => {
        const manager = new PollControllerManager();
        const controllers = new Array(10)
          .fill(null)
          .map(() => manager.create());

        manager.tailUntil(controllers[7]);
        expect(
          controllers
            .slice(0, 7)
            .every((controller) => controller.signal.aborted),
        ).toBe(true);
        expect(
          controllers
            .slice(7)
            .every((controller) => !controller.signal.aborted),
        ).toBe(true);
      });

      it("doesn't abort anything if controller not found", () => {
        const manager = new PollControllerManager();
        const controllers = new Array(10)
          .fill(null)
          .map(() => manager.create());

        manager.tailUntil(new AbortController());
        expect(
          controllers.every((controller) => !controller.signal.aborted),
        ).toBe(true);
      });
    });
  });

  describe("abortAll", () => {
    it("aborts everything", () => {
      const manager = new PollControllerManager();
      const controllers = new Array(10).fill(null).map(() => manager.create());

      manager.abortAll();
      expect(controllers.every((controller) => controller.signal.aborted)).toBe(
        true,
      );
    });

    it("only creates aborted controllers after", () => {
      const manager = new PollControllerManager();
      manager.abortAll();
      expect(manager.create().signal.aborted).toBe(true);
    });
  });
});
