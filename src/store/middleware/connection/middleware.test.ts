import type { UnknownAction } from "@reduxjs/toolkit";
import type { MockInstance } from "vitest";

import type { Store } from "store/store";
import { rootStateFactory } from "testing/factories";
import { createStore } from "testing/utils";
import { logger } from "utils/logger";

import * as connectionManagerModule from "./connection-manager";
import type { ManagedConnection } from "./connection-manager";
import {
  connectionMiddleware,
  MISSING_WS_CONTROLLER_URL_ERROR,
} from "./middleware";

type ConnectionManager = (typeof connectionManagerModule)["ConnectionManager"];
type ConnectionManagerInstance = InstanceType<ConnectionManager>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createAction(withConnection?: boolean, connectionList?: string[]) {
  return {
    type: "some-action",
    payload: {
      wsControllerURL: "wss://example.com/",
    },
    meta: {
      withConnection,
      connectionList,
    },
  };
}

describe("connectionMiddleware", () => {
  // Mocks.
  let getMock: MockInstance<ConnectionManagerInstance["get"]>;
  let logoutMock: MockInstance<ConnectionManagerInstance["logout"]>;

  // Middleware.
  let store: Store;
  let _actions: UnknownAction[];
  let next: MockInstance<(action: unknown) => unknown>;
  let middleware: (action: unknown) => unknown;

  beforeEach(() => {
    vi.useFakeTimers();

    getMock = vi.fn();
    logoutMock = vi.fn();
    vi.spyOn(connectionManagerModule, "ConnectionManager").mockImplementation(
      // @ts-expect-error Mocking a class
      function (_hooks) {
        // @ts-expect-error Mocking a class
        this.get = getMock;
        // @ts-expect-error Mocking a class
        this.logout = logoutMock;
      },
    );

    [store, _actions] = createStore(rootStateFactory.build(), {
      trackActions: true,
    });
    next = vi.fn();
    middleware = connectionMiddleware(store)(
      // @ts-expect-error Mocked function can be passed as next.
      next,
    );
  });

  describe("with `meta.withConnection`", () => {
    let getPromise: PromiseWithResolvers<ManagedConnection>;
    let action: UnknownAction;
    beforeEach(() => {
      getPromise = Promise.withResolvers();
      getMock.mockReturnValue(getPromise.promise);

      action = createAction(true);
    });

    it("fetches connection from `wsControllerURL` by default", async ({
      expect,
    }) => {
      middleware(action);
      await vi.runOnlyPendingTimersAsync();
      expect(getMock).toHaveBeenCalledExactlyOnceWith("wss://example.com/");
      // Next shouldn't be called, as connection hasn't been resolved.
      expect(next).not.toHaveBeenCalled();
    });

    it("doesn't call next until connection provided", async ({ expect }) => {
      middleware(action);
      await vi.runOnlyPendingTimersAsync();
      expect(getMock).toHaveBeenCalledExactlyOnceWith("wss://example.com/");
      // Next shouldn't be called, as connection hasn't been resolved.
      expect(next).not.toHaveBeenCalled();

      const connection = {} as ManagedConnection;
      getPromise.resolve(connection);
      await vi.runOnlyPendingTimersAsync();

      // Connection should be attached to action.
      expect(next).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            connections: {
              wsControllerURL: connection,
            },
          }),
        }),
      );
    });

    it("warns if `wsControllerURL` not present", async ({ expect }) => {
      const loggerSpy = vi.spyOn(logger, "warn");
      // @ts-expect-error - deleting key on inferred type.
      delete action.payload.wsControllerURL;

      middleware(action);
      await vi.runOnlyPendingTimersAsync();
      expect(next).toHaveBeenCalledExactlyOnceWith(action);

      expect(loggerSpy).toHaveBeenCalledExactlyOnceWith(
        MISSING_WS_CONTROLLER_URL_ERROR,
        action,
      );
    });
  });

  it("fetches connections from `connections` key", async ({ expect }) => {
    const connection1 = {} as ManagedConnection;
    const connection2 = {} as ManagedConnection;
    getMock
      .mockResolvedValueOnce(connection1)
      .mockResolvedValueOnce(connection2);

    const action = {
      type: "some-action",
      payload: {
        modelUrl: "wss://model.com",
        controllerUrl: "wss://controller.com",
        otherKey: "something",
      },
      meta: {
        withConnection: true,
        connectionList: ["modelUrl", "controllerUrl"],
      },
    };
    middleware(action);
    await vi.runOnlyPendingTimersAsync();
    expect(getMock).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          connections: {
            modelUrl: connection1,
            controllerUrl: connection2,
          },
        }),
      }),
    );
  });

  it.for([
    ["not present", undefined],
    ["false", false],
  ] as const)(
    "ignores action without `meta.withConnection` (%s)",
    async ([_, withConnection], { expect }) => {
      const action = createAction(withConnection);
      middleware(action);
      await vi.runOnlyPendingTimersAsync();
      expect(next).toHaveBeenCalledExactlyOnceWith(action);
    },
  );
});
