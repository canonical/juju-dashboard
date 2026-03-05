import { createPollingSource, PollControllerManager } from "./pollingSource";
import { SourceState } from "./source";
import { tick } from "./testUtils";

describe("createPollingSource", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("setup", () => {
    it("immediately calls poll function", async () => {
      const pollFn = vi.fn();
      const source = createPollingSource(pollFn, { interval: { seconds: 1 } });
      expect(pollFn).toHaveBeenCalledTimes(1);
      source.done();
    });

    it.for([
      ["non-async", (): number => 1],
      ["async", async (): Promise<number> => 1],
    ] as const)("handles %s poll function", async ([_, pollFn], { expect }) => {
      const source = createPollingSource(pollFn, { interval: { seconds: 1 } });
      await tick();
      expect(source.data).toBe(1);
      source.done();
    });

    it("handles poll function which immediately throws an error", async () => {
      const error = new Error("an error");
      const pollFn = vi
        .fn()
        .mockImplementationOnce(() => {
          throw error;
        })
        .mockReturnValue(123);
      const source = createPollingSource(pollFn, { interval: { seconds: 1 } });
      await tick();
      expect(pollFn).toBeCalledTimes(1);
      expect(source.state).toBe(SourceState.Error);
      expect(source.error?.source).toEqual(error);

      await vi.advanceTimersByTimeAsync(1000);
      await tick();
      expect(pollFn).toBeCalledTimes(2);
      expect(source.state).toBe(SourceState.Valid);
      expect(source.data).toBe(123);
      expect(source.error).toBe(null);
      source.done();
    });
  });

  describe("polling", () => {
    it("continually calls poll function", async () => {
      let callCount = 0;
      const pollFn = vi.fn().mockImplementation(() => callCount++);
      const source = createPollingSource(pollFn, { interval: { seconds: 1 } });
      await tick();

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

      source.done();
    });

    describe("source done", () => {
      it("stops polling", async () => {
        const pollFn = vi.fn();
        const source = createPollingSource(pollFn, {
          interval: { seconds: 1 },
        });
        await tick();

        // Source should be polled as normal.
        expect(pollFn).toBeCalledTimes(1);
        await vi.advanceTimersByTimeAsync(1000);
        expect(pollFn).toBeCalledTimes(2);

        // Source marked as done.
        source.done();

        // Poll function should never be called again, no matter how long is waited.
        await vi.advanceTimersByTimeAsync(5000);
        expect(pollFn).toBeCalledTimes(2);
      });

      it("aborts in progress polls", async () => {
        const inProgress = Promise.withResolvers();
        const pollFn = vi.fn().mockReturnValueOnce(inProgress.promise);
        const source = createPollingSource(pollFn, {
          interval: { seconds: 1 },
        });
        await tick();

        const firstPollSignal: AbortSignal = pollFn.mock.calls[0][0];

        // Source should be polled.
        expect(pollFn).toBeCalledTimes(1);
        expect(firstPollSignal.aborted).toBe(false);

        // Source marked as done.
        source.done();

        expect(firstPollSignal.aborted).toBe(true);

        // Clean up promise to prevent leak.
        inProgress.resolve(null);
      });
    });

    describe("slow poll function", () => {
      it("calls next poll function while waiting", async () => {
        const wontResolve = Promise.withResolvers();
        const pollFn = vi
          .fn()
          // Initially returns a promise that won't resolve.
          .mockReturnValueOnce(wontResolve.promise)
          // Then returns a promise that will resolve to a value.
          .mockResolvedValueOnce(123);
        const source = createPollingSource(pollFn, {
          interval: { seconds: 1 },
        });
        await tick();

        // Initially, poll function should be called and source should be loading.
        expect(pollFn).toHaveBeenCalledTimes(1);
        expect(source.loading).toBe(true);
        expect(source.data).toBe(null);

        // Even though poll hasn't completed, next poll function should be called.
        await vi.advanceTimersByTimeAsync(1000);
        expect(pollFn).toHaveBeenCalledTimes(2);
        // Since second poll function has resolved, source should reflect that data.
        expect(source.loading).toBe(false);
        expect(source.data).toBe(123);

        // Clean up resources.
        source.done();
        wontResolve.resolve(123);
      });

      it("ignores if it succeeds", async () => {
        const slowPollPromise = Promise.withResolvers();
        const pollFn = vi
          .fn()
          // Initially returns a promise that won't resolve.
          .mockReturnValueOnce(slowPollPromise.promise)
          // Then returns a promise that will resolve to a value.
          .mockResolvedValueOnce(123);
        const source = createPollingSource(pollFn, {
          interval: { seconds: 1 },
        });
        await tick();

        // Initially, poll function should be called and source should be loading.
        expect(pollFn).toHaveBeenCalledTimes(1);
        expect(source.loading).toBe(true);
        expect(source.data).toBe(null);

        // Allow second poll to succeed.
        await vi.advanceTimersByTimeAsync(1000);
        expect(pollFn).toHaveBeenCalledTimes(2);
        expect(source.loading).toBe(false);
        expect(source.data).toBe(123);

        // Resolve first poll, and ensure it's data was ignored.
        slowPollPromise.resolve(456);
        await tick();
        expect(source.data).toBe(123);

        source.done();
      });

      it("aborts slow poll function if newer one succeeds", async () => {
        const slowPollPromise = Promise.withResolvers();
        const pollFn = vi
          .fn()
          // Initially returns a promise that won't resolve.
          .mockReturnValueOnce(slowPollPromise.promise)
          // Then returns a promise that will resolve to a value.
          .mockResolvedValueOnce(123);
        const source = createPollingSource(pollFn, {
          interval: { seconds: 1 },
        });
        await tick();

        // Extract the signal given to the first call.
        const firstPollSignal: AbortSignal = pollFn.mock.calls[0][0];
        expect(firstPollSignal.aborted).toBe(false);

        // Allow the second poll to succeed.
        await vi.advanceTimersByTimeAsync(1000);
        expect(pollFn).toHaveBeenCalledTimes(2);

        // First poll should've been aborted.
        expect(firstPollSignal.aborted).toBe(true);

        // Clean up.
        source.done();
        slowPollPromise.resolve(123);
      });

      it("immediately aborts incomplete request when `tailRequests` = 0", async () => {
        const requests = new Array(3)
          .fill(null)
          .map(() => Promise.withResolvers());
        let nextRequest = 0;
        const pollFn = vi.fn().mockImplementation(async () => {
          if (nextRequest >= requests.length) {
            throw new Error("no more requests");
          }

          const { promise } = requests[nextRequest];
          nextRequest += 1;
          return promise;
        });
        const source = createPollingSource(pollFn, {
          interval: { seconds: 1 },
          tailRequests: 0,
        });

        await vi.advanceTimersByTimeAsync(1000);
        expect(pollFn).toBeCalledTimes(2);
        const firstSignal: AbortSignal = pollFn.mock.calls[0][0];
        const secondSignal: AbortSignal = pollFn.mock.calls[1][0];
        expect(firstSignal.aborted).toBe(true);
        expect(secondSignal.aborted).toBe(false);

        await vi.advanceTimersByTimeAsync(1000);
        expect(pollFn).toBeCalledTimes(3);
        const thirdSignal: AbortSignal = pollFn.mock.calls[2][0];
        expect(secondSignal.aborted).toBe(true);
        expect(thirdSignal.aborted).toBe(false);

        await vi.advanceTimersByTimeAsync(1000);
        expect(pollFn).toBeCalledTimes(4);
        const fourthSignal: AbortSignal = pollFn.mock.calls[3][0];
        expect(thirdSignal.aborted).toBe(true);
        expect(fourthSignal.aborted).toBe(false);

        // Clean up.
        source.done();
        for (const request of requests) {
          request.resolve(null);
        }
      });

      it.for([[3], [5], [1]] as const)(
        "retains incomplete requests when `tailRequests` = %i",
        async ([tailRequests], { expect }) => {
          const requests = new Array(tailRequests + 2)
            .fill(null)
            .map(() => Promise.withResolvers());
          let nextRequest = 0;
          const pollFn = vi.fn().mockImplementation(async () => {
            if (nextRequest >= requests.length) {
              throw new Error("no more requests");
            }

            const { promise } = requests[nextRequest];
            nextRequest += 1;
            return promise;
          });
          const source = createPollingSource(pollFn, {
            interval: { seconds: 1 },
            tailRequests,
          });

          // Advance to start `tailRequests + 1` requests
          await vi.advanceTimersByTimeAsync(1000 * tailRequests);
          expect(pollFn).toBeCalledTimes(tailRequests + 1);

          // Nothing should be aborted yet.
          for (let i = 0; i <= tailRequests; i++) {
            const signal: AbortSignal = pollFn.mock.calls[i][0];
            expect(signal.aborted).toBe(false);
          }

          // Advance by 1 second to start one more poll.
          await vi.advanceTimersByTimeAsync(1000);
          expect(pollFn).toBeCalledTimes(tailRequests + 2);

          // First signal should be aborted.
          const firstSignal: AbortSignal = pollFn.mock.calls[0][0];
          expect(firstSignal.aborted).toBe(true);

          // Next `tailRequests + 1` signals should be active.
          for (let i = 1; i <= tailRequests + 1; i++) {
            const signal: AbortSignal = pollFn.mock.calls[i][0];
            expect(signal.aborted).toBe(false);
          }

          // Clean up.
          source.done();
          for (const request of requests) {
            request.resolve(null);
          }
        },
      );
    });

    describe("fallback data", () => {
      it("uses older data if newer poll fails", async () => {
        const pollFn = vi
          .fn()
          .mockResolvedValueOnce(123)
          .mockRejectedValueOnce(new Error());
        const source = createPollingSource(pollFn, {
          interval: { seconds: 1 },
        });
        await tick();

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

        source.done();
      });

      it("waits for older data if newer poll fails", async () => {
        const dataPromise = Promise.withResolvers();
        const pollFn = vi
          .fn()
          .mockReturnValueOnce(dataPromise.promise)
          .mockRejectedValueOnce(new Error());
        const source = createPollingSource(pollFn, {
          interval: { seconds: 1 },
        });
        await tick();

        // Poll function should've been called, and source should be loading.
        expect(pollFn).toHaveBeenCalledTimes(1);
        expect(source.loading).toBe(true);

        // Advance to when the next poll is due.
        await vi.advanceTimersByTimeAsync(1000);
        expect(pollFn).toHaveBeenCalledTimes(2);
        // Source should show error.
        expect(source.data).toBe(null);
        expect(source.loading).toBe(false);
        expect(source.state).toBe(SourceState.Error);

        // Resolve the old poll function.
        dataPromise.resolve(123);
        await tick();
        // Source should include data, while showing error.
        expect(source.data).toEqual(123);
        expect(source.loading).toBe(false);
        expect(source.state).toBe(SourceState.Error);

        source.done();
      });
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
