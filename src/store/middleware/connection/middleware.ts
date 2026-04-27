import { createAction } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/react";
import { isAction, type Middleware } from "redux";

import { Auth } from "auth";
import { disableControllerUUIDMasking } from "juju/api";
import { actions as generalActions } from "store/general";
import {
  getAnalyticsEnabled,
  getAppVersion,
  getIsJuju,
  getUserPass,
} from "store/general/selectors";
import type { AuthCredential } from "store/general/types";
import type { RootState, Store } from "store/store";
import { isMetaAction, isPayloadAction } from "types";
import analytics from "utils/analytics";
import { logger } from "utils/logger";

import type { ManagedConnection } from "./connection-manager";
import { ConnectionManager } from "./connection-manager";
import { hasConnectionURL } from "./util";

export const MISSING_WS_CONTROLLER_URL_ERROR =
  "Action passed to connection middleware with `meta.withConnection: true`, but missing `payload.wsControllerURL`";

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
      }

      if (
        !isAction(action) ||
        !isPayloadAction(action) ||
        !isMetaAction(action)
      ) {
        return next(action);
      }

      const withConnection =
        "withConnection" in action.meta &&
        typeof action.meta.withConnection === "boolean" &&
        action.meta.withConnection;

      if (withConnection) {
        const connectionList = Array.isArray(action.meta.connectionList)
          ? action.meta.connectionList
          : ["wsControllerURL"];
        const actionConnections: Record<
          (typeof connectionList)[number],
          ManagedConnection
        > = {};

        for (const connectionKey of connectionList) {
          if (typeof connectionKey !== "string") {
            continue;
          }

          if (hasConnectionURL(action, connectionKey)) {
            // Action has the `withConnection` property, so attach the connection to it.
            const connection = await connections.get(
              action.payload[connectionKey],
            );
            actionConnections[connectionKey] = connection;
          } else {
            // Warn that `withConnection` won't do anything unless there's a matching connection key.
            logger.warn(MISSING_WS_CONTROLLER_URL_ERROR, action);
          }
        }

        action.meta = Object.assign(action.meta ?? {}, {
          connections: actionConnections,
        });
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
