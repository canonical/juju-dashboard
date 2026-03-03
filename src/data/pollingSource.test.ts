import { createPollingSource } from "./pollingSource";
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
      createPollingSource(pollFn, { interval: { seconds: 1 } });
      expect(pollFn).toHaveBeenCalledTimes(1);
    });

    it.for([
      ["non-async", (): number => 1],
      ["async", async (): Promise<number> => 1],
    ] as const)("handles %s poll function", async ([_, pollFn], { expect }) => {
      const source = createPollingSource(pollFn, { interval: { seconds: 1 } });
      await tick();
      expect(source.data).toBe(1);
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
    });
  });

  describe("polling", () => {
    it("continually calls poll function", async () => {
      const pollFn = vi.fn();
      createPollingSource(pollFn, { interval: { seconds: 1 } });
      await tick();

      for (let i = 0; i < 5; i++) {
        expect(pollFn).toBeCalledTimes(i + 1);

        // Partially advance timers.
        await vi.advanceTimersByTimeAsync(999);
        expect(pollFn).toBeCalledTimes(i + 1);

        // Advance remaining duration, ready for next loop.
        await vi.advanceTimersByTimeAsync(1);
      }
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
        const pollFn = vi.fn().mockReturnValueOnce(new Promise(() => {}));
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
      });
    });

    describe("slow poll function", () => {
      it("calls next poll function while waiting", async () => {
        const pollFn = vi
          .fn()
          // Initially returns a promise that won't resolve.
          .mockReturnValueOnce(new Promise(() => {}))
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
      });

      it("aborts slow poll function", async () => {
        const slowPollPromise = Promise.withResolvers();
        const pollFn = vi
          .fn()
          // Initially returns a promise that won't resolve.
          .mockReturnValueOnce(slowPollPromise.promise)
          // Then returns a promise that will resolve to a value.
          .mockResolvedValueOnce(123);
        createPollingSource(pollFn, {
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
      });
    });
  });
});
