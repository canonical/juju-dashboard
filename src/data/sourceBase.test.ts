import type { Mock, MockInstance } from "vitest";

import { tick } from "../testing/tsUtils";

import type { Source } from "./source";
import { SourceState } from "./source";
import { createSource, type SourceHooks, type SourceBase } from "./sourceBase";

const DUMMY_HOOKS = { refetch: (): void => {} } satisfies SourceHooks;

describe("createSource", () => {
  describe("setup", () => {
    it("begins in unknown state with no data", () => {
      const source = createSource(() => {
        return DUMMY_HOOKS;
      });

      expect(source.state).toEqual(SourceState.Unknown);
      expect(source.loading).toEqual(false);
      expect(source.data).toBeNull();
      expect(source.error).toBeNull();
    });

    it("calls setup callback function", () => {
      const setup = vi.fn();
      createSource(setup);

      expect(setup).toHaveBeenCalledOnce();
    });

    it("handles setup which throws an error", () => {
      const setupError = new Error("setup error");

      const source = createSource(() => {
        throw setupError;
      });

      expect(source.state).toEqual(SourceState.Error);
      expect(source.loading).toEqual(false);
      expect(source.data).toBeNull();
      expect(source.error?.message).toEqual("setup error");
      expect(source.error?.source).toEqual(setupError);
    });
  });

  describe("SourceBase", () => {
    describe("load", () => {
      it("begins loading state when `load` function called", () => {
        const source = createSource(({ load }) => {
          // Immediately call the load function.
          load(Promise.resolve());
          return DUMMY_HOOKS;
        });

        expect(source.loading).toEqual(true);
      });

      it("updates state when `data` promise resolves", async () => {
        const dataPromise = Promise.withResolvers();

        const source = createSource(({ load }) => {
          load(dataPromise.promise);
          return DUMMY_HOOKS;
        });

        // Initially source is loading.
        expect(source.loading).toEqual(true);

        const outputData = {};
        dataPromise.resolve(outputData);

        // Allow promise callbacks to run.
        await tick();

        // Source must complete loading, and update it's state.
        expect(source.loading).toEqual(false);
        expect(source.state).toEqual(SourceState.Valid);
        expect(source.data).toEqual(outputData);
      });

      describe("`AbortSignal`", () => {
        it("clears loading state if latest load is cancelled", async () => {
          const controller = new AbortController();
          const pendingPromise = Promise.withResolvers();

          const source = createSource(({ load }) => {
            // Immediately begin loading data, with a signal.
            load(pendingPromise.promise, controller.signal);
            return DUMMY_HOOKS;
          });

          // Initially source is loading.
          expect(source.loading).toEqual(true);

          // Abort the signal.
          controller.abort();

          // Source should no longer be loading.
          expect(source.loading).toEqual(false);

          // Clean up.
          pendingPromise.resolve(null);
        });

        it("data is ignored after signal aborts", async () => {
          const controller = new AbortController();
          const dataPromise = Promise.withResolvers();

          const source = createSource(({ load }) => {
            load(dataPromise.promise, controller.signal);
            return DUMMY_HOOKS;
          });

          // Ensure source is loading, then abort, then ensure it's not loading.
          expect(source.loading).toEqual(true);
          controller.abort();
          expect(source.loading).toEqual(false);

          // Resolve the data promise.
          dataPromise.resolve(123);

          // Allow callbacks to run.
          await tick();

          // Ensure data was ignored.
          expect(source.data).toBeNull();
          expect(source.state).toEqual(SourceState.Unknown);
        });

        it("error is ignored after signal aborts", async () => {
          const controller = new AbortController();
          const dataPromise = Promise.withResolvers();

          const source = createSource(({ load }) => {
            load(dataPromise.promise, controller.signal);
            return DUMMY_HOOKS;
          });

          // Ensure source is loading, then abort, then ensure it's not loading.
          expect(source.loading).toEqual(true);
          controller.abort();
          expect(source.loading).toEqual(false);

          // Reject the data promise.
          dataPromise.reject(new Error("some error"));

          // Allow callbacks to run.
          await tick();

          // Ensure data was ignored.
          expect(source.error).toBeNull();
          expect(source.state).toEqual("unknown");
        });

        it("allows subsequent loads to succeed after an abort", async () => {
          const controller = new AbortController();
          const dataPromise = Promise.withResolvers();
          const wontResolve = Promise.withResolvers();

          const source = createSource(({ load }) => {
            // Begin a load that will never finish.
            load(wontResolve.promise);

            // Immediately begin a second load.
            load(dataPromise.promise);

            return DUMMY_HOOKS;
          });

          // Ensure source is loading, then abort the first load request.
          expect(source.loading).toEqual(true);
          controller.abort();

          // Source should still be loading, as second request is pending.
          expect(source.loading).toEqual(true);
          dataPromise.resolve(123);

          // Allow callbacks to run.
          await tick();

          expect(source.data).toEqual(123);

          // Clean up.
          wontResolve.resolve(123);
        });
      });

      describe("races", () => {
        it("prioritises loaded data by start time", async () => {
          const dataPromises = [
            Promise.withResolvers(),
            Promise.withResolvers(),
          ];

          const source = createSource(({ load }) => {
            // Begin loading promise 0 first.
            load(dataPromises[0].promise);
            // Immediately begin loading promise 1 after.
            load(dataPromises[1].promise);

            return DUMMY_HOOKS;
          });

          // Resolve promise 1 first.
          dataPromises[1].resolve(123);
          await tick();

          // Source should no longer be loading, and should present the data.
          expect(source.data).toEqual(123);
          expect(source.loading).toEqual(false);

          // Then resolve promise 0.
          dataPromises[0].resolve(456);
          await tick();

          // Source should ignore the older data.
          expect(source.data).toEqual(123);
          expect(source.loading).toEqual(false);
        });

        it("uses older requests whilst waiting for newer requests", async () => {
          const dataPromises = [
            Promise.withResolvers(),
            Promise.withResolvers(),
          ];

          const source = createSource(({ load }) => {
            // Begin loading promise 0 first.
            load(dataPromises[0].promise);
            // Immediately begin loading promise 1 after.
            load(dataPromises[1].promise);

            return DUMMY_HOOKS;
          });

          // Resolve promise 0 first.
          dataPromises[0].resolve(456);
          await tick();

          // Source should use the latest data, but still indicate that it's loading.
          expect(source.data).toEqual(456);
          expect(source.loading).toEqual(true);

          // Then resolve promise 1.
          dataPromises[1].resolve(123);
          await tick();

          // Source should use the latest data, and finish loading.
          expect(source.data).toEqual(123);
          expect(source.loading).toEqual(false);
        });

        it("shows old data loaded after newer error", async () => {
          const dataPromises = [
            Promise.withResolvers(),
            Promise.withResolvers(),
          ];

          const source = createSource(({ load }) => {
            // Begin loading promise 0 first.
            load(dataPromises[0].promise);
            // Immediately begin loading promise 1 after.
            load(dataPromises[1].promise);

            return DUMMY_HOOKS;
          });

          // Reject promise 1 first.
          dataPromises[1].reject(new Error());
          await tick();

          // Source should display the error.
          expect(source.error).not.toEqual(null);
          expect(source.state).toEqual(SourceState.Error);
          expect(source.loading).toEqual(false);

          // Then resolve promise 0.
          dataPromises[0].resolve(123);
          await tick();

          // Source should use the latest data, but indicate the error still.
          expect(source.data).toEqual(123);
          expect(source.error).not.toEqual(null);
          expect(source.state).toEqual(SourceState.Error);
          expect(source.loading).toEqual(false);
        });
      });

      describe("when `data` promise rejects", () => {
        it.for([
          ["an `Error`", new Error("Something happened"), "Something happened"],
          ["a non-`Error`", 374, "An unknown error occurred"],
        ] as const)(
          "handles %s",
          async ([_, error, expectedMessage], { expect }) => {
            const dataPromise = Promise.withResolvers();

            const source = createSource(({ load }) => {
              load(dataPromise.promise);
              return DUMMY_HOOKS;
            });

            expect(source.loading).toEqual(true);
            dataPromise.reject(error);
            await tick();

            expect(source.loading).toEqual(false);
            expect(source.state).toEqual(SourceState.Error);
            expect(source.error?.source).toEqual(error);
            expect(source.error?.message).toEqual(expectedMessage);
          },
        );

        it("clears error after next successful load", async () => {
          const dataPromises = new Array(2)
            .fill(null)
            .map(() => Promise.withResolvers());
          const source = createSource(({ load }) => {
            load(dataPromises[0].promise);
            load(dataPromises[1].promise);
            return DUMMY_HOOKS;
          });
          expect(source.loading).toEqual(true);

          // Reject the first load.
          dataPromises[0].reject(new Error());
          await tick();
          expect(source.state).toBe(SourceState.Error);
          expect(source.loading).toBe(true);
          expect(source.error).not.toBe(null);

          // Resolve the second load.
          dataPromises[1].resolve(123);
          await tick();
          expect(source.state).toBe(SourceState.Valid);
          expect(source.loading).toBe(false);
          expect(source.error).toBe(null);
        });
      });
    });

    describe("sourceDone", () => {
      it("throws an error if `load` called after `sourceDone` aborts", () => {
        const setupFn = vi.fn().mockReturnValue(DUMMY_HOOKS);
        const source = createSource(setupFn);
        const { load }: SourceBase<unknown> = setupFn.mock.calls[0][0];

        // Terminate the source.
        source.done();

        // Attempt to load data.
        expect(() => {
          load(Promise.resolve(123));
        }).toThrowError("cannot load after source done");
      });
    });
  });

  describe("external API", () => {
    // Tests for verifying functionality of `Source<T>` interface.
    it("works", () => {
      expect(true).toEqual(true);
    });

    describe("done", () => {
      it("triggers `sourceDone` signal in setup", () => {
        const setupFn = vi.fn().mockReturnValue(DUMMY_HOOKS);
        const source = createSource(setupFn);
        const { sourceDone }: SourceBase<unknown> = setupFn.mock.calls[0][0];

        expect(sourceDone.aborted).toEqual(false);
        source.done();
        expect(sourceDone.aborted).toEqual(true);
      });
    });

    describe("invalidate", () => {
      it("calls `refetch` callback from setup", () => {
        const refetch = vi.fn();

        const source = createSource(() => {
          return { refetch };
        });

        expect(refetch).not.toHaveBeenCalled();
        expect(source.state).toEqual(SourceState.Unknown);
        source.invalidate();
        expect(refetch).toHaveBeenCalled();
        expect(source.state).toEqual(SourceState.Stale);

        // Invalidating the source does not mean that it's loading.
        expect(source.loading).toEqual(false);
      });

      it("clears `stale` state when loading after `refetch`", async () => {
        const refetch = vi.fn();
        const setupFn = vi.fn().mockReturnValue({ refetch });
        const source = createSource(setupFn);
        const { load }: SourceBase<unknown> = setupFn.mock.calls[0][0];

        // Initially unknown.
        expect(source.state).toEqual(SourceState.Unknown);

        // Invalidate the source to make it stale.
        source.invalidate();
        expect(source.state).toEqual(SourceState.Stale);

        // Perform load.
        load(Promise.resolve(123));
        await tick();

        // Source should now be valid.
        expect(source.state).toEqual(SourceState.Valid);
      });
    });

    describe("on", () => {
      describe("unsubscribe", () => {
        it("doesn't continue to call handler", async () => {
          const dataPromises = [
            Promise.withResolvers(),
            Promise.withResolvers(),
          ];
          const source = createSource(({ load }) => {
            load(dataPromises[0].promise);
            load(dataPromises[1].promise);
            return DUMMY_HOOKS;
          });

          const loadHandler = vi.fn();
          const unsubscribe = source.on("data", loadHandler);

          // Resolve the first load.
          dataPromises[0].resolve(123);
          await tick();
          expect(loadHandler).toHaveBeenCalledTimes(1);

          // Unsubscribe the handler.
          unsubscribe();

          // Resolve second load.
          dataPromises[1].resolve(456);
          await tick();

          // Handler should not be called again.
          expect(loadHandler).toHaveBeenCalledTimes(1);
        });

        it("only unsubscribes the requested handler", async () => {
          const dataPromises = [
            Promise.withResolvers(),
            Promise.withResolvers(),
          ];
          const source = createSource(({ load }) => {
            load(dataPromises[0].promise);
            load(dataPromises[1].promise);
            return DUMMY_HOOKS;
          });

          const loadHandlers = [vi.fn(), vi.fn()];
          const unsubscribe = source.on("data", loadHandlers[0]);
          source.on("data", loadHandlers[1]);

          // Resolve the first load.
          dataPromises[0].resolve(123);
          await tick();
          expect(loadHandlers[0]).toHaveBeenCalledTimes(1);
          expect(loadHandlers[1]).toHaveBeenCalledTimes(1);

          // Unsubscribe the handler.
          unsubscribe();

          // Resolve second load.
          dataPromises[1].resolve(456);
          await tick();

          // Removed handler should not be called again.
          expect(loadHandlers[0]).toHaveBeenCalledTimes(1);
          // Other handler should still be called.
          expect(loadHandlers[1]).toHaveBeenCalledTimes(2);
        });
      });

      it("handles multiple callbacks", async () => {
        const dataPromise = Promise.withResolvers();
        const source = createSource(({ load }) => {
          load(dataPromise.promise);
          return DUMMY_HOOKS;
        });

        // Add handlers.
        const loadHandlers = [vi.fn(), vi.fn(), vi.fn()];
        source.on("data", loadHandlers[0]);
        source.on("data", loadHandlers[1]);
        source.on("data", loadHandlers[2]);

        // Load data.
        dataPromise.resolve(123);
        await tick();

        // All handlers should be called.
        expect(loadHandlers[0]).toHaveBeenCalledTimes(1);
        expect(loadHandlers[1]).toHaveBeenCalledTimes(1);
        expect(loadHandlers[2]).toHaveBeenCalledTimes(1);
      });

      it("ignores errors in callbacks", async () => {
        const dataPromises = [Promise.withResolvers(), Promise.withResolvers()];
        const source = createSource(({ load }) => {
          load(dataPromises[0].promise);
          load(dataPromises[1].promise);
          return DUMMY_HOOKS;
        });

        const someError = new Error("some error");

        // Add handlers.
        const badLoadHandler = vi.fn().mockImplementation(() => {
          throw someError;
        });
        const loadHandler = vi.fn();
        source.on("data", badLoadHandler);
        source.on("data", loadHandler);

        // Load data.
        dataPromises[0].resolve(123);
        await tick();

        // Both handlers should've been called.
        expect(badLoadHandler).toHaveBeenCalledTimes(1);
        expect(loadHandler).toHaveBeenCalledTimes(1);

        // Source should still end in correct state.
        expect(source.state).toEqual(SourceState.Valid);

        // Load more data.
        dataPromises[1].resolve(456);
        await tick();

        // Handlers should continue to be called.
        expect(badLoadHandler).toHaveBeenCalledTimes(2);
        expect(loadHandler).toHaveBeenCalledTimes(2);
      });

      describe("event: load", () => {
        it("calls on load start", () => {
          const setupFn = vi.fn().mockReturnValue(DUMMY_HOOKS);
          const source = createSource(setupFn);
          const { load }: SourceBase<unknown> = setupFn.mock.calls[0][0];

          // Subscribe to the event.
          const loadHandler = vi.fn();
          source.on("load", loadHandler);

          // Shouldn't be called by default.
          expect(loadHandler).not.toHaveBeenCalled();

          // Initiate a load.
          const loadPromise = Promise.withResolvers();
          load(loadPromise.promise);

          // Callback should be provided with the same data promise.
          expect(loadHandler).toHaveBeenCalledExactlyOnceWith(
            loadPromise.promise,
          );

          // Clean up the promise.
          loadPromise.resolve(null);
        });

        it("calls with multiple concurrent loads", async () => {
          const setupFn = vi.fn().mockReturnValue(DUMMY_HOOKS);
          const source = createSource(setupFn);
          const { load }: SourceBase<unknown> = setupFn.mock.calls[0][0];

          // Subscribe to the event.
          const loadHandler = vi.fn();
          source.on("load", loadHandler);

          // Create a collection of data promises.
          const loadPromises = new Array(3)
            .fill(null)
            .map(() => Promise.withResolvers());

          // Trigger a load for each promise.
          for (const loadPromise of loadPromises) {
            load(loadPromise.promise);

            // Allow time for callbacks to run.
            await tick();
          }

          // Event callback should be called once for each load.
          expect(loadHandler).toHaveBeenCalledTimes(3);

          // Each call should contain the corresponding data promise.
          for (let i = 0; i < loadPromises.length; i++) {
            const loadPromise = loadPromises[i].promise;
            expect(loadHandler).nthCalledWith(i + 1, loadPromise);
          }

          // Clean up promises.
          for (const loadPromise of loadPromises) {
            loadPromise.resolve(null);
          }
        });
      });

      describe("event: loadEnd", () => {
        it("triggers after single data load", async () => {
          const dataPromise = Promise.withResolvers();

          const source = createSource(({ load }) => {
            load(dataPromise.promise);
            return DUMMY_HOOKS;
          });

          const loadEndHandler = vi.fn();
          source.on("loadEnd", loadEndHandler);

          // Shouldn't be called initially.
          expect(loadEndHandler).not.toHaveBeenCalled();

          // Resolve the load.
          dataPromise.resolve(123);
          await tick();
          expect(loadEndHandler).toHaveBeenCalledTimes(1);
        });

        it("triggers after final overlapping loads", async () => {
          const dataPromises = [
            Promise.withResolvers(),
            Promise.withResolvers(),
          ];

          const source = createSource(({ load }) => {
            load(dataPromises[0].promise);
            load(dataPromises[1].promise);
            return DUMMY_HOOKS;
          });

          const loadEndHandler = vi.fn();
          source.on("loadEnd", loadEndHandler);

          expect(loadEndHandler).not.toHaveBeenCalled();

          // Resolve the last data promise, which should be passed through.
          dataPromises[0].resolve(123);
          await tick();
          expect(loadEndHandler).not.toHaveBeenCalled();

          // Resolve the first data promise, which should be ignored.
          dataPromises[1].resolve(456);
          await tick();
          expect(loadEndHandler).toHaveBeenCalledTimes(1);
        });
      });

      describe("event: data", () => {
        it("calls callback after data load", async () => {
          const dataPromise = Promise.withResolvers();

          const source = createSource(({ load }) => {
            load(dataPromise.promise);
            return DUMMY_HOOKS;
          });

          const dataHandler = vi.fn();
          source.on("data", dataHandler);

          // Shouldn't be called initially.
          expect(dataHandler).not.toHaveBeenCalled();

          // Resolve the load.
          dataPromise.resolve(123);
          await tick();
          expect(dataHandler).toHaveBeenCalledExactlyOnceWith(123);
        });

        it("calls callback with subsequent loads", async () => {
          const dataPromises = [
            Promise.withResolvers(),
            Promise.withResolvers(),
          ];

          const source = createSource(({ load }) => {
            load(dataPromises[0].promise);
            load(dataPromises[1].promise);
            return DUMMY_HOOKS;
          });

          const dataHandler = vi.fn();
          source.on("data", dataHandler);

          expect(dataHandler).not.toHaveBeenCalled();

          // Resolve the last data promise, which should be passed through.
          dataPromises[0].resolve(123);
          await tick();
          expect(dataHandler).toHaveBeenCalledExactlyOnceWith(123);

          // Resolve the first data promise, which should be ignored.
          dataPromises[1].resolve(456);
          await tick();
          expect(dataHandler).nthCalledWith(2, 456);
        });

        it("calls callback with overlapping loads", async () => {
          const dataPromises = [
            Promise.withResolvers(),
            Promise.withResolvers(),
          ];

          const source = createSource(({ load }) => {
            load(dataPromises[0].promise);
            load(dataPromises[1].promise);
            return DUMMY_HOOKS;
          });

          const dataHandler = vi.fn();
          source.on("data", dataHandler);

          expect(dataHandler).not.toHaveBeenCalled();

          // Resolve the last data promise, which should be passed through.
          dataPromises[1].resolve(123);
          await tick();
          expect(dataHandler).toHaveBeenCalledExactlyOnceWith(123);

          // Resolve the first data promise, which should be ignored.
          dataPromises[0].resolve(456);
          await tick();
          expect(dataHandler).toHaveBeenCalledTimes(1);
        });
      });

      describe("event: error", () => {
        it("calls callback after load error", async () => {
          const errorPromise = Promise.withResolvers();

          const source = createSource(({ load }) => {
            load(errorPromise.promise);
            return DUMMY_HOOKS;
          });

          const errorHandler = vi.fn();
          source.on("error", errorHandler);

          // Shouldn't be called initially.
          expect(errorHandler).not.toHaveBeenCalled();

          const loadError = new Error("load error");

          // Reject with error.
          errorPromise.reject(loadError);
          await tick();
          expect(errorHandler).toHaveBeenCalledExactlyOnceWith(
            "load error",
            loadError,
          );
        });

        it("calls callback with subsequent load errors", async () => {
          const errorPromises = [
            Promise.withResolvers(),
            Promise.withResolvers(),
          ];

          const source = createSource(({ load }) => {
            load(errorPromises[0].promise);
            load(errorPromises[1].promise);
            return DUMMY_HOOKS;
          });

          const errorHandler = vi.fn();
          source.on("error", errorHandler);

          expect(errorHandler).not.toHaveBeenCalled();

          const errors = new Array(2)
            .fill(null)
            .map((_, i) => new Error(`load error ${i}`));

          // Resolve the last data promise, which should be passed through.
          errorPromises[0].reject(errors[0]);
          await tick();
          expect(errorHandler).toHaveBeenCalledExactlyOnceWith(
            "load error 0",
            errors[0],
          );

          // Resolve the first data promise, which should be ignored.
          errorPromises[1].reject(errors[1]);
          await tick();
          expect(errorHandler).nthCalledWith(2, "load error 1", errors[1]);
        });

        it("calls callback with overlapping load errors", async () => {
          const errorPromises = [
            Promise.withResolvers(),
            Promise.withResolvers(),
          ];

          const source = createSource(({ load }) => {
            load(errorPromises[0].promise);
            load(errorPromises[1].promise);
            return DUMMY_HOOKS;
          });

          const errorHandler = vi.fn();
          source.on("error", errorHandler);

          expect(errorHandler).not.toHaveBeenCalled();

          const errors = new Array(2)
            .fill(null)
            .map((_, i) => new Error(`load error ${i}`));

          // Reject the last promise, which should be passed through.
          errorPromises[1].reject(errors[1]);
          await tick();
          expect(errorHandler).toHaveBeenCalledExactlyOnceWith(
            "load error 1",
            errors[1],
          );

          // Reject the first promise, which should be ignored.
          errorPromises[0].reject(errors[0]);
          await tick();
          expect(errorHandler).toHaveBeenCalledTimes(1);
        });
      });

      describe("event: errorCleared", () => {
        it("triggers after successful load", async () => {
          const loadPromises = [
            Promise.withResolvers(),
            Promise.withResolvers(),
          ];

          const source = createSource(({ load }) => {
            load(loadPromises[0].promise);
            load(loadPromises[1].promise);
            return DUMMY_HOOKS;
          });

          const errorClearedHandler = vi.fn();
          source.on("errorCleared", errorClearedHandler);

          // Shouldn't be called initially.
          expect(errorClearedHandler).not.toHaveBeenCalled();

          const loadError = new Error("load error");

          // Reject with error.
          loadPromises[0].reject(loadError);
          await tick();
          expect(errorClearedHandler).not.toHaveBeenCalled();

          // Successful load.
          loadPromises[1].resolve(123);
          await tick();
          expect(errorClearedHandler).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe("async iterator", () => {
      it("yields for every new value", async () => {
        const loadPromises = [Promise.withResolvers(), Promise.withResolvers()];
        const source = createSource(({ load }) => {
          load(loadPromises[0].promise);
          load(loadPromises[1].promise);
          return DUMMY_HOOKS;
        });

        const iterator = source[Symbol.asyncIterator]();

        const first = iterator.next();
        loadPromises[0].resolve(1);
        expect(await first).toStrictEqual({ value: 1, done: false });

        const second = iterator.next();
        loadPromises[1].resolve(2);
        expect(await second).toStrictEqual({ value: 2, done: false });
      });

      it("independently yields different iterators", async () => {
        const loadPromises = [Promise.withResolvers(), Promise.withResolvers()];
        const source = createSource(({ load }) => {
          load(loadPromises[0].promise);
          load(loadPromises[1].promise);
          return DUMMY_HOOKS;
        });

        const iterator1 = source[Symbol.asyncIterator]();
        const iterator2 = source[Symbol.asyncIterator]();

        const first1 = iterator1.next();
        const first2 = iterator2.next();
        loadPromises[0].resolve(1);
        expect(await first1).toStrictEqual({ value: 1, done: false });
        expect(await first2).toStrictEqual({ value: 1, done: false });

        const second1 = iterator1.next();
        const second2 = iterator2.next();
        loadPromises[1].resolve(2);
        expect(await second1).toStrictEqual({ value: 2, done: false });
        expect(await second2).toStrictEqual({ value: 2, done: false });
      });

      it("terminates when source complete", async () => {
        const source = createSource(() => DUMMY_HOOKS);
        const iterator = source[Symbol.asyncIterator]();

        const next = iterator.next();
        source.done();
        expect(await next).toStrictEqual({ value: undefined, done: true });
      });

      it("doesn't produce unhandled error after finishing", async ({
        onTestFinished,
      }) => {
        vi.useFakeTimers();

        // Install a listener on the process to detect when an unhandled error is raised.
        const unhandledRejectionListener = vi.fn();
        process.on("unhandledRejection", unhandledRejectionListener);
        onTestFinished(() => {
          process.off("unhandledRejection", unhandledRejectionListener);
        });

        // Ensure the hook is correctly installed.
        const testError = new Error("test error");
        void Promise.reject(testError);
        await vi.runAllTimersAsync();
        expect(unhandledRejectionListener).toHaveBeenCalledExactlyOnceWith(
          testError,
          expect.any(Promise),
        );
        unhandledRejectionListener.mockReset();

        const source = createSource(({ load }) => {
          load(Promise.resolve(1));
          return DUMMY_HOOKS;
        });

        // Begin iterator, and immediately stop it.
        for await (const _ of source) {
          break;
        }

        // Clean up source
        source.done();

        // Give unhandled rejection a chance to propagate.
        await vi.runAllTimersAsync();
        expect(unhandledRejectionListener).not.toHaveBeenCalled();
      });

      describe("cleans up listener", () => {
        let promise: PromiseWithResolvers<number>;
        let source: Source<number>;
        let unsubscribe: Mock;
        let spy: MockInstance;

        beforeEach(() => {
          promise = Promise.withResolvers();
          source = createSource(({ load }) => {
            load(promise.promise);
            return DUMMY_HOOKS;
          });
          const { on } = source;
          spy = vi.spyOn(source, "on").mockImplementation((...args) => {
            unsubscribe = vi.fn(on(...args));
            return unsubscribe;
          });
        });

        it("after source done", async ({ expect }) => {
          const iterator = source[Symbol.asyncIterator]();
          const next = iterator.next();

          expect(spy).toHaveBeenCalledTimes(1);
          expect(unsubscribe).toHaveBeenCalledTimes(0);

          source.done();
          await next;
          expect(unsubscribe).toHaveBeenCalledTimes(1);
        });

        it("with for..of loop", async ({ expect }) => {
          const check = (async (): Promise<void> => {
            for await (const _item of source) {
              expect(spy).toHaveBeenCalledTimes(1);
              break;
            }
          })();
          promise.resolve(123);
          await check;

          expect(unsubscribe).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
