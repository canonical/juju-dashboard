import type { Client } from "@canonical/jujulib";
import { createAction } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/react";
import { isAction, type Middleware } from "redux";

import { Auth } from "auth";
import { disableControllerUUIDMasking, loginWithBakery } from "juju/api";
import { Label, type ConnectionWithFacades } from "juju/types";
import { actions as generalActions } from "store/general";
import {
  getAnalyticsEnabled,
  getAppVersion,
  getIsJuju,
  getUserPass,
} from "store/general/selectors";
import type { AuthCredential } from "store/general/types";
import type { RootState, Store } from "store/store";
import { isPayloadAction } from "types";
import analytics from "utils/analytics";
import { logger } from "utils/logger";

type Hooks = {
  getCredentials: (wsControllerURL: string) => AuthCredential | undefined;
  onConnection?: (
    wsControllerURL: string,
    connection: ConnectionWithFacades,
  ) => Promise<void> | void;
};

export class ConnectionManager {
  private connections = new Map<
    string,
    | {
        connection: ConnectionWithFacades;
        intervalId?: number;
        juju?: Client;
      }
    | Promise<ConnectionWithFacades>
  >();
  private hooks: Hooks;

  constructor(hooks: Hooks) {
    this.hooks = hooks;
  }

  /**
   * Fetch the connection for a given controller. If the connection doesn't exist, then create it
   * before returning.
   */
  async get(wsControllerURL: string): Promise<ConnectionWithFacades> {
    const existing = this.connections.get(wsControllerURL);
    if (existing !== undefined) {
      if (existing instanceof Promise) {
        return await existing;
      } else {
        return existing.connection;
      }
    }
    return await this.connect(wsControllerURL);
  }

  /**
   * Logout from a connection.
   */
  async logout(wsControllerURL: string): Promise<void> {
    // Wait to get the connection;
    let connection = undefined;
    do {
      connection = this.connections.get(wsControllerURL);
      if (!connection) {
        return;
      } else if (connection instanceof Promise) {
        await connection;
        connection = undefined;
      }
    } while (connection === undefined);

    // Remove it from the map.
    this.connections.delete(wsControllerURL);

    if (connection.intervalId !== undefined) {
      clearInterval(connection.intervalId);
    }
    if (connection.juju) {
      await new Promise<void>((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        connection.juju!.logout((code, cb) => {
          resolve();
          cb(code);
        });
      });
    }
  }

  /**
   * Produce an iterator of all connection URLs.
   */
  public *[Symbol.iterator](): Iterator<string> {
    yield* this.connections.keys();
  }

  /**
   * Connect to a controller, and save it.
   */
  private async connect(
    wsControllerURL: string,
  ): Promise<ConnectionWithFacades> {
    const connectionPromise = Promise.withResolvers<ConnectionWithFacades>();
    this.connections.set(wsControllerURL, connectionPromise.promise);

    const credentials = this.hooks.getCredentials(wsControllerURL);

    const continueConnection = await Auth.instance.beforeControllerConnect({
      wsControllerURL,
      credentials,
    });
    if (!continueConnection) {
      throw new Error("could not continue connection");
    }

    const {
      conn: connection,
      error,
      juju,
      intervalId,
    } = await loginWithBakery(wsControllerURL, credentials).catch((cause) => {
      logger.error(
        "Unable to log into the controller, check that the controller address is correct and that it is online.",
        cause,
      );
      throw new Error(
        "Unable to log into the controller, check that the controller address is correct and that it is online.",
        { cause },
      );
    });
    if (error) {
      throw new Error(Label.CONTROLLER_LOGIN_ERROR);
    }
    if (!connection) {
      throw new Error("Could not connect to controller");
    }

    this.connections.set(wsControllerURL, {
      connection,
      intervalId: intervalId ?? undefined,
      juju,
    });
    connectionPromise.resolve(connection);

    await this.hooks.onConnection?.(wsControllerURL, connection);

    return connection;
  }
}

/**
 * Action to logout from the given controller.
 */
export const logoutAction = createAction<{ wsControllerURL: string }>(
  "connection-manager/logout",
);

type MiddlewareStore = Middleware<void, RootState, Store["dispatch"]>;

/**
 * Create a new instance of the connection manager middleware.
 *
 * This function returns the middleware, and the underlying connection pool. It is intended for use
 * within the model-poller middleware for migration, until those actions no longer require direct
 * access to the connections.
 */
export function createConnectionMiddleware(): {
  middleware: MiddlewareStore;
  connections: ConnectionManager;
} {
  let hoistedStore: null | Parameters<MiddlewareStore>[0] = null;
  function getStore(): NonNullable<typeof hoistedStore> {
    if (!hoistedStore) {
      throw new Error("store was not hoisted");
    }
    return hoistedStore;
  }

  const connections = new ConnectionManager({
    getCredentials: (wsControllerURL): AuthCredential | undefined =>
      getUserPass(getStore().getState(), wsControllerURL),
    onConnection: async (wsControllerURL, connection): Promise<void> => {
      const store = getStore();

      // Allows info to be serialised.
      delete connection.info.getFacade;

      const analyticsEnabled = getAnalyticsEnabled(store.getState());
      const isJuju = getIsJuju(store.getState()) ?? false;
      const dashboardVersion = getAppVersion(store.getState()) ?? "";
      const controllerVersion = connection.info.serverVersion ?? "";
      const jimmVersion = connection.facades.jimM?.version ?? 0;

      // XXX Now that we can register multiple controllers this needs
      // to be sent per controller.
      if (analyticsEnabled) {
        analytics(
          !!analyticsEnabled,
          { dashboardVersion, controllerVersion, isJuju: isJuju.toString() },
          {
            category: "Authentication",
            action: `User Login (${Auth.instance.name})`,
          },
        );

        Sentry.setTag("jujuVersion", controllerVersion);
      }

      // Store the controller info. The transport and facades are not used
      // (or available by other means) so no need to store them.
      store.dispatch(
        generalActions.updateControllerConnection({
          wsControllerURL,
          info: connection.info,
        }),
      );
      store.dispatch(
        generalActions.updateControllerFeatures({
          wsControllerURL,
          features: {
            auditLogs: jimmVersion >= 4,
            crossModelQueries: jimmVersion >= 4,
            rebac: jimmVersion >= 4,
          },
        }),
      );

      if (!isJuju) {
        // This call will be a noop if the user isn't an administrator
        // on the JIMM controller we're connected to.
        try {
          await disableControllerUUIDMasking(connection);
        } catch (err) {
          // Silently fail, if this doesn't work then the user isn't authorized
          // to perform the action.
        }
      }
    },
  });

  const middleware: ReturnType<
    typeof createConnectionMiddleware
  >["middleware"] = (store) => (next) => {
    hoistedStore = store;

    return async (action) => {
      if (logoutAction.match(action)) {
        // Directly respond to logout action, and do not pass it on.
        await connections.logout(action.payload.wsControllerURL);
        return;
      } else if (
        isAction(action) &&
        isPayloadAction(action) &&
        "withConnection" in action.payload &&
        typeof action.payload.withConnection === "string"
      ) {
        // Action has the `withConnection` property, so attach the connection to it.
        const connection = await connections.get(action.payload.withConnection);

        const metaAction = action as {
          meta?: Record<string, unknown>;
        } & typeof action;
        metaAction.meta = Object.assign(metaAction.meta ?? {}, { connection });
      }

      return next(action);
    };
  };

  return { middleware, connections };
}

export const connectionMiddleware: Middleware<
  void,
  RootState,
  Store["dispatch"]
> = (store) => {
  const { middleware } = createConnectionMiddleware();
  return middleware(store);
};
