import type { Source } from "./source";
import { createSource, type SourceHooks, type SourceBase } from "./sourceBase";

const DUMMY_HOOKS = { refetch: (): void => {} } satisfies SourceHooks;

/**
 * Helper function that will resolve at the next tick.
 */
async function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("createSource", () => {
  describe("setup", () => {
    it("begins in unknown state with no data", () => {
      const source = createSource(() => {
        return DUMMY_HOOKS;
      });

      expect(source.state).toEqual("unknown");
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

      expect(source.state).toEqual("error");
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
          load(new Promise(() => {}));
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
        expect(source.state).toEqual("valid");
        expect(source.data).toEqual(outputData);
      });

      describe("`AbortSignal`", () => {
        it("clears loading state if latest load is cancelled", async () => {
          const controller = new AbortController();

          const source = createSource(({ load }) => {
            // Immediately begin loading data, with a signal.
            load(new Promise(() => {}), controller.signal);
            return DUMMY_HOOKS;
          });

          // Initially source is loading.
          expect(source.loading).toEqual(true);

          // Abort the signal.
          controller.abort();

          // Source should no longer be loading.
          expect(source.loading).toEqual(false);
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
          expect(source.state).toEqual("unknown");
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

          const source = createSource(({ load }) => {
            // Begin a load that will never finish.
            load(new Promise(() => {}), controller.signal);

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
          expect(source.state).toEqual("error");
          expect(source.loading).toEqual(false);

          // Then resolve promise 0.
          dataPromises[0].resolve(123);
          await tick();

          // Source should use the latest data, but indicate the error still.
          expect(source.data).toEqual(123);
          expect(source.error).not.toEqual(null);
          expect(source.state).toEqual("error");
          expect(source.loading).toEqual(false);
        });
      });

      describe("handles errors when `data` promise rejects", () => {
        /**
         * Create a source which immediately begins loading. The load will reject with the provided
         * error value.
         */
        async function runTest(error: unknown): Promise<Source<unknown>> {
          const dataPromise = Promise.withResolvers();

          const source = createSource(({ load }) => {
            load(dataPromise.promise);
            return DUMMY_HOOKS;
          });

          expect(source.loading).toEqual(true);

          dataPromise.reject(error);

          await tick();

          return source;
        }

        it("with an `Error`", async () => {
          const error = new Error("Something happened");
          const source = await runTest(error);

          expect(source.loading).toEqual(false);
          expect(source.state).toEqual("error");
          expect(source.error?.source).toEqual(error);
          expect(source.error?.message).toEqual("Something happened");
        });

        it("with some other error value", async () => {
          const error = 374;
          const source = await runTest(error);

          expect(source.loading).toEqual(false);
          expect(source.state).toEqual("error");
          expect(source.error?.source).toEqual(error);
          expect(source.error?.message).toEqual("An unknown error occurred");
        });
      });
    });

    describe("sourceDone", () => {
      it("throws an error if `load` called after `sourceDone` aborts", () => {
        let hoistedLoad: SourceBase<unknown>["load"];

        const source = createSource(({ load }) => {
          hoistedLoad = load;
          return DUMMY_HOOKS;
        });

        // Terminate the source.
        source.done();

        // Attempt to load data.
        expect(() => {
          hoistedLoad!(new Promise(() => {})); // eslint-disable-line @typescript-eslint/no-non-null-assertion
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
        let hoistedSourceDone: SourceBase<unknown>["sourceDone"];

        const source = createSource(({ sourceDone }) => {
          hoistedSourceDone = sourceDone;
          return DUMMY_HOOKS;
        });

        expect(hoistedSourceDone!.aborted).toEqual(false); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        source.done();
        expect(hoistedSourceDone!.aborted).toEqual(true); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      });
    });

    describe("invalidate", () => {
      it("calls `refetch` callback from setup", () => {
        const refetch = vi.fn();

        const source = createSource(() => {
          return { refetch };
        });

        expect(refetch).not.toHaveBeenCalled();
        expect(source.state).toEqual("unknown");
        source.invalidate();
        expect(refetch).toHaveBeenCalled();
        expect(source.state).toEqual("stale");

        // Invalidating the source does not mean that it's loading.
        expect(source.loading).toEqual(false);
      });

      it("clears `stale` state when loading after `refetch`", async () => {
        const refetch = vi.fn();
        let hoistedLoad;

        const source = createSource(({ load }) => {
          hoistedLoad = load;

          return { refetch };
        });

        // Initially unknown.
        expect(source.state).toEqual("unknown");

        // Invalidate the source to make it stale.
        source.invalidate();
        expect(source.state).toEqual("stale");

        // Perform load.
        hoistedLoad!(Promise.resolve(123)); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        await tick();

        // Source should now be valid.
        expect(source.state).toEqual("valid");
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
        const badLoadHandler = vi.fn().mockRejectedValue(someError);
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
        expect(source.state).toEqual("valid");

        // Load more data.
        dataPromises[1].resolve(456);
        await tick();

        // Handlers should continue to be called.
        expect(badLoadHandler).toHaveBeenCalledTimes(2);
        expect(loadHandler).toHaveBeenCalledTimes(2);
      });

      describe("event: load", () => {
        it("calls on load start", () => {
          let hoistedLoad;
          const source = createSource(({ load }) => {
            hoistedLoad = load;
            return DUMMY_HOOKS;
          });

          // Subscribe to the event.
          const loadHandler = vi.fn();
          source.on("load", loadHandler);

          // Shouldn't be called by default.
          expect(loadHandler).not.toHaveBeenCalled();

          // Initiate a load.
          const loadPromise = new Promise(() => {});
          hoistedLoad!(loadPromise); // eslint-disable-line @typescript-eslint/no-non-null-assertion

          // Callback should be provided with the same data promise.
          expect(loadHandler).toHaveBeenCalledExactlyOnceWith(loadPromise);
        });

        it("calls with multiple concurrent loads", async () => {
          let hoistedLoad;
          const source = createSource(({ load }) => {
            hoistedLoad = load;
            return DUMMY_HOOKS;
          });

          // Subscribe to the event.
          const loadHandler = vi.fn();
          source.on("load", loadHandler);

          // Create a collection of data promises.
          const loadPromises = new Array(3)
            .fill(null)
            .map(async () => new Promise(() => {}));

          // Trigger a load for each promise.
          for (const loadPromise of loadPromises) {
            hoistedLoad!(loadPromise); // eslint-disable-line @typescript-eslint/no-non-null-assertion

            // Allow time for callbacks to run.
            await tick();
          }

          // Event callback should be called once for each load.
          expect(loadHandler).toHaveBeenCalledTimes(3);

          // Each call should contain the corresponding data promise.
          for (let i = 0; i < loadPromises.length; i++) {
            const loadPromise = loadPromises[i];
            expect(loadHandler).nthCalledWith(i + 1, loadPromise);
          }
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
    });
  });
});
