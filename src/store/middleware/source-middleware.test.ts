import type { PayloadAction } from "@reduxjs/toolkit";
import { createAction } from "@reduxjs/toolkit";
import type { Mock } from "vitest";

import type { SourceInstance } from "./source-middleware";
import createMiddleware, {
  createSourceInstance,
  SourceManager,
} from "./source-middleware";

describe("SourceManager", () => {
  describe("start", () => {
    it("starts source with args", () => {
      const fn = vi.fn();
      const manager = new SourceManager(fn);
      const args = { something: true, number: 3172 };
      manager.start(args);
      expect(fn).toHaveBeenCalledExactlyOnceWith(args);
    });

    it("attaches listeners", () => {
      const onFn = vi.fn();
      const fn = vi.fn().mockReturnValue({ on: onFn });
      const cbFns = {
        data: vi.fn(),
        load: vi.fn(),
        error: vi.fn(),
      };
      const manager = new SourceManager(fn);
      manager.start({}, cbFns);
      expect(onFn).toHaveBeenNthCalledWith(1, "data", cbFns.data);
      expect(onFn).toHaveBeenNthCalledWith(2, "load", cbFns.load);
      expect(onFn).toHaveBeenNthCalledWith(3, "error", cbFns.error);
    });

    it("doesn't start existing source", () => {
      const fn = vi.fn().mockReturnValue({});
      const manager = new SourceManager(fn);
      const firstSource = manager.start({ id: 100 });
      const secondSource = manager.start({ id: 100 });
      expect(fn).toHaveBeenCalledTimes(1);
      expect(firstSource).toEqual(secondSource);
    });
  });

  describe("stop", () => {
    it("stops source", () => {
      const doneFn = vi.fn();
      const fn = vi.fn().mockReturnValue({ done: doneFn });
      const manager = new SourceManager(fn);
      manager.start({});
      manager.stop({});
      expect(doneFn).toHaveBeenCalledTimes(1);
    });

    it("ignores if source not started", () => {
      const doneFn = vi.fn();
      const fn = vi.fn().mockReturnValue({ done: doneFn });
      const manager = new SourceManager(fn);
      manager.stop({});
      expect(doneFn).not.toHaveBeenCalled();
    });
  });

  describe("invalidate", () => {
    it("invalidates source matching args", () => {
      const invalidateFn = vi.fn();
      const fn = vi.fn().mockReturnValue({ invalidate: invalidateFn });
      const manager = new SourceManager(fn);
      manager.start({});
      manager.invalidate({});
      expect(invalidateFn).toHaveBeenCalledTimes(1);
    });

    it("ignores other sources", () => {
      const invalidateFn1 = vi.fn();
      const invalidateFn2 = vi.fn();
      const fn = vi
        .fn()
        .mockReturnValueOnce({ invalidate: invalidateFn1 })
        .mockReturnValueOnce({ invalidate: invalidateFn2 });
      const manager = new SourceManager(fn);
      manager.start({ id: 1 });
      manager.start({ id: 2 });
      manager.invalidate({ id: 1 });
      expect(invalidateFn1).toHaveBeenCalledTimes(1);
      expect(invalidateFn2).not.toHaveBeenCalled();
    });
  });
});

describe("source middleware", () => {
  const SET_DATA_ACTION = createAction<unknown>("setData");
  const SET_LOADING_ACTION = createAction<unknown>("setLoading");
  const SET_ERROR_ACTION = createAction<unknown>("setError");
  const DUMMY_SOURCE_ACTIONS = {
    setData: (args: unknown, data: unknown): PayloadAction<unknown> =>
      SET_DATA_ACTION({ args, data }),
    setLoading: (args: unknown, loading: boolean): PayloadAction<unknown> =>
      SET_LOADING_ACTION({ args, loading }),
    setError: (args: unknown, error: unknown): PayloadAction<unknown> =>
      SET_ERROR_ACTION({ args, error }),
  };

  function createMocks(): {
    next: Mock;
    store: { getState: Mock; dispatch: Mock };
  } {
    return {
      next: vi.fn(),
      store: {
        getState: vi.fn().mockReturnValue({}),
        dispatch: vi.fn(),
      },
    };
  }

  it.for([
    ["non-action", { something: true }],
    ["other action", createAction<void>("someAction")()],
  ] as const)("ignores %s", ([_, action], { expect }) => {
    const { next, store } = createMocks();
    const middleware = createMiddleware([])(store)(next);

    const nextReturn = {};
    next.mockReturnValue(nextReturn);

    expect(middleware(action)).toEqual(nextReturn);
    expect(next).toHaveBeenCalledExactlyOnceWith(action);
  });

  describe("single source", () => {
    it.for(["start", "stop", "invalidate"] as const)(
      "intercepts %s action",
      (action, { expect }) => {
        const { next, store } = createMocks();
        const source = createSourceInstance(
          "mySource",
          vi.fn().mockReturnValue({ on: vi.fn() }),
          DUMMY_SOURCE_ACTIONS,
        );
        const middleware = createMiddleware([source])(store)(next);

        middleware(source.actions[action]({}));
        expect(next).not.toHaveBeenCalled();
      },
    );

    describe("start", () => {
      it("starts a source", () => {
        const { next, store } = createMocks();
        const onFn = vi.fn();
        const source = createSourceInstance(
          "source",
          vi.fn().mockReturnValue({ on: onFn }),
          DUMMY_SOURCE_ACTIONS,
        );
        const middleware = createMiddleware([source])(store)(next);

        middleware(source.actions.start({}));

        // Ensure all events were registered.
        expect(onFn).toHaveBeenCalledTimes(5);
        expect(onFn).toHaveBeenCalledWith("data", expect.any(Function));
        expect(onFn).toHaveBeenCalledWith("load", expect.any(Function));
        expect(onFn).toHaveBeenCalledWith("loadEnd", expect.any(Function));
        expect(onFn).toHaveBeenCalledWith("error", expect.any(Function));
        expect(onFn).toHaveBeenCalledWith("errorCleared", expect.any(Function));
      });

      describe("source event handlers", () => {
        it.for([
          ["data", [123], DUMMY_SOURCE_ACTIONS.setData({}, 123)],
          ["load", [], DUMMY_SOURCE_ACTIONS.setLoading({}, true)],
          ["loadEnd", [], DUMMY_SOURCE_ACTIONS.setLoading({}, false)],
          [
            "error",
            ["some error", new Error("some error")],
            DUMMY_SOURCE_ACTIONS.setError(
              {},
              {
                message: "some error",
                source: new Error("some error"),
              },
            ),
          ],
          ["errorCleared", [], DUMMY_SOURCE_ACTIONS.setError({}, null)],
        ] as const)(
          "%s",
          ([event, handlerArguments, expectedAction], { expect }) => {
            const { next, store } = createMocks();
            // Start the source via middleware.
            const onFn = vi.fn();
            const source = createSourceInstance(
              "source",
              vi.fn().mockReturnValue({ on: onFn }),
              DUMMY_SOURCE_ACTIONS,
            );
            const middleware = createMiddleware([source])(store)(next);
            middleware(source.actions.start({}));

            // Extract the event handler.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const [_, handler] = onFn.mock.calls.find(
              ([callEvent, _handler]) => callEvent === event,
            )!;

            // Call the event handler with the provided arguments.
            handler(...handlerArguments);

            // Ensure that the middleware dispatches the correct action.
            expect(store.dispatch).toHaveBeenCalledExactlyOnceWith(
              expectedAction,
            );
          },
        );
      });

      it("ignores start if source already started", () => {
        const { next, store } = createMocks();
        const createSourceFn = vi.fn().mockReturnValue({ on: vi.fn() });
        const source = createSourceInstance(
          "source",
          createSourceFn,
          DUMMY_SOURCE_ACTIONS,
        );
        const middleware = createMiddleware([source])(store)(next);
        expect(createSourceFn).toHaveBeenCalledTimes(0);
        middleware(source.actions.start({ id: 123 }));
        expect(createSourceFn).toHaveBeenCalledTimes(1);
        middleware(source.actions.start({ id: 123 }));
        expect(createSourceFn).toHaveBeenCalledTimes(1);
      });

      it("starts source with different arguments", () => {
        const { next, store } = createMocks();
        const createSourceFn = vi.fn().mockReturnValue({ on: vi.fn() });
        const source = createSourceInstance(
          "source",
          createSourceFn,
          DUMMY_SOURCE_ACTIONS,
        );
        const middleware = createMiddleware([source])(store)(next);
        expect(createSourceFn).toHaveBeenCalledTimes(0);
        middleware(source.actions.start({ id: 123 }));
        expect(createSourceFn).toHaveBeenCalledTimes(1);
        middleware(source.actions.start({ id: 456 }));
        expect(createSourceFn).toHaveBeenCalledTimes(2);
      });
    });

    describe("stop", () => {
      it("stops a source if started", () => {
        const { next, store } = createMocks();
        const doneFn = vi.fn();
        const createSourceFn = vi
          .fn()
          .mockReturnValue({ on: vi.fn(), done: doneFn });
        const source = createSourceInstance(
          "source",
          createSourceFn,
          DUMMY_SOURCE_ACTIONS,
        );
        const middleware = createMiddleware([source])(store)(next);
        middleware(source.actions.start({ id: 123 }));
        expect(doneFn).not.toHaveBeenCalled();
        middleware(source.actions.stop({ id: 123 }));
        expect(doneFn).toHaveBeenCalledTimes(1);
      });

      it("ignores if source not running", () => {
        const { next, store } = createMocks();
        const doneFn = vi.fn();
        const createSourceFn = vi
          .fn()
          .mockReturnValue({ on: vi.fn(), done: doneFn });
        const source = createSourceInstance(
          "source",
          createSourceFn,
          DUMMY_SOURCE_ACTIONS,
        );
        const middleware = createMiddleware([source])(store)(next);
        middleware(source.actions.stop({ id: 123 }));
        expect(doneFn).not.toHaveBeenCalled();
      });

      it("only stops specified source", () => {
        const { next, store } = createMocks();
        const doneFns = [vi.fn(), vi.fn()];
        const createSourceFn = vi
          .fn()
          .mockReturnValueOnce({ on: vi.fn(), done: doneFns[0] })
          .mockReturnValueOnce({ on: vi.fn(), done: doneFns[1] });
        const source = createSourceInstance(
          "source",
          createSourceFn,
          DUMMY_SOURCE_ACTIONS,
        );
        const middleware = createMiddleware([source])(store)(next);
        middleware(source.actions.start({ id: 123 }));
        middleware(source.actions.start({ id: 456 }));
        expect(doneFns[0]).not.toHaveBeenCalled();
        expect(doneFns[1]).not.toHaveBeenCalled();
        middleware(source.actions.stop({ id: 123 }));
        expect(doneFns[0]).toHaveBeenCalledTimes(1);
        expect(doneFns[1]).not.toHaveBeenCalled();
        middleware(source.actions.stop({ id: 456 }));
        expect(doneFns[0]).toHaveBeenCalledTimes(1);
        expect(doneFns[1]).toHaveBeenCalledTimes(1);
      });
    });

    describe("invalidate", () => {
      it("invalidates a source if started", () => {
        const { next, store } = createMocks();
        const invalidateFn = vi.fn();
        const createSourceFn = vi
          .fn()
          .mockReturnValue({ on: vi.fn(), invalidate: invalidateFn });
        const source = createSourceInstance(
          "source",
          createSourceFn,
          DUMMY_SOURCE_ACTIONS,
        );
        const middleware = createMiddleware([source])(store)(next);
        middleware(source.actions.start({ id: 123 }));
        expect(invalidateFn).not.toHaveBeenCalled();
        middleware(source.actions.invalidate({ id: 123 }));
        expect(invalidateFn).toHaveBeenCalledTimes(1);
      });

      it("ignores if source not running", () => {
        const { next, store } = createMocks();
        const invalidateFn = vi.fn();
        const createSourceFn = vi
          .fn()
          .mockReturnValue({ on: vi.fn(), invalidate: invalidateFn });
        const source = createSourceInstance(
          "source",
          createSourceFn,
          DUMMY_SOURCE_ACTIONS,
        );
        const middleware = createMiddleware([source])(store)(next);
        middleware(source.actions.invalidate({ id: 123 }));
        expect(invalidateFn).not.toHaveBeenCalled();
      });

      it("only invalidates specified source", () => {
        const { next, store } = createMocks();
        const invalidateFns = [vi.fn(), vi.fn()];
        const createSourceFn = vi
          .fn()
          .mockReturnValueOnce({ on: vi.fn(), invalidate: invalidateFns[0] })
          .mockReturnValueOnce({ on: vi.fn(), invalidate: invalidateFns[1] });
        const source = createSourceInstance(
          "source",
          createSourceFn,
          DUMMY_SOURCE_ACTIONS,
        );
        const middleware = createMiddleware([source])(store)(next);
        middleware(source.actions.start({ id: 123 }));
        middleware(source.actions.start({ id: 456 }));
        expect(invalidateFns[0]).not.toHaveBeenCalled();
        expect(invalidateFns[1]).not.toHaveBeenCalled();
        middleware(source.actions.invalidate({ id: 123 }));
        expect(invalidateFns[0]).toHaveBeenCalledTimes(1);
        expect(invalidateFns[1]).not.toHaveBeenCalled();
        middleware(source.actions.invalidate({ id: 456 }));
        expect(invalidateFns[0]).toHaveBeenCalledTimes(1);
        expect(invalidateFns[1]).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("multiple sources", () => {
    function mockInstance(name: string): {
      instance: SourceInstance<Record<string, never>, number>;
      spies: { [K in keyof SourceInstance<unknown, unknown>["actions"]]: Mock };
    } {
      const instance = createSourceInstance(
        name,
        vi.fn().mockImplementation(() => ({ on: vi.fn() })),
        {
          setData: vi.fn(),
          setLoading: vi.fn(),
          setError: vi.fn(),
        },
      );

      const spies: Partial<Record<"invalidate" | "start" | "stop", Mock>> = {};
      const { createSource } = instance;
      instance.createSource = (): ReturnType<typeof createSource> => {
        const source = createSource();

        for (const action of ["start", "stop", "invalidate"] as const) {
          spies[action] = vi.spyOn(source, action);
        }

        return source;
      };

      return {
        instance,
        spies: spies as Required<typeof spies>,
      };
    }

    it.for([["start"], ["stop"], ["invalidate"]] as const)(
      "routes %s action",
      ([action], { expect }) => {
        const { store, next } = createMocks();
        const instances = new Array(5)
          .fill(null)
          .map((_, i) => mockInstance(`source-${i}`));
        const middleware = createMiddleware<
          SourceInstance<Record<string, never>, number>,
          Record<string, never>,
          number
        >(instances.map(({ instance }) => instance))(store)(next);

        // Try each instance
        for (const { spies, instance } of instances) {
          // Dispatch the action.
          middleware(instance.actions[action]());

          expect(spies[action]).toHaveBeenCalledOnce();
          for (const { spies: otherSpies } of instances) {
            if (otherSpies === spies) {
              continue;
            }

            expect(otherSpies[action]).not.toHaveBeenCalled();
          }

          vi.clearAllMocks();
        }
      },
    );
  });

  describe("createSourceInstance", () => {
    it("creates unique actions for different sources", () => {
      const sourceA = createSourceInstance(
        "sourceA",
        vi.fn(),
        DUMMY_SOURCE_ACTIONS,
      );
      const sourceB = createSourceInstance(
        "sourceB",
        vi.fn(),
        DUMMY_SOURCE_ACTIONS,
      );

      expect(sourceA.actions.start.type).not.toEqual(
        sourceB.actions.start.type,
      );
      expect(sourceA.actions.stop.type).not.toEqual(sourceB.actions.stop.type);
      expect(sourceA.actions.invalidate.type).not.toEqual(
        sourceB.actions.invalidate.type,
      );
    });
  });
});
