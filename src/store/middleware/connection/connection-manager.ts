import { connectAndLogin } from "@canonical/jujulib";

import { Auth } from "auth";
import {
  CLIENT_VERSION,
  generateConnectionOptions,
  loginWithBakery,
} from "juju/api";
import { Label, type ConnectionWithFacades } from "juju/types";
import type { AuthCredential } from "store/general/types";
import { logger } from "utils/logger";

type Hooks = {
  getCredentials: (wsControllerURL: string) => AuthCredential | undefined;
  onConnection?: (
    wsControllerURL: string,
    connection: ConnectionWithFacades,
  ) => Promise<void> | void;
};

/**
 * The result of a connection handler.
 */
type ConnectionResult = {
  connection: ConnectionWithFacades;
  onClose?: () => PromiseLike<void>;
};

/**
 * A function which resolves with a connection for a given URL and credentials.
 */
type ConnectionHandler = (
  wsControllerURL: string,
  credentials: AuthCredential | undefined,
) => Promise<ConnectionResult>;

/**
 * Symbol representing the default handler.
 */
export const DefaultHandler = Symbol();

/**
 * Map of URL paths to a connection handler, with `DefaultHandler` suitable for any connection kind.
 */
export const CONNECTION_HANDLERS_BY_PATH: Record<
  string | typeof DefaultHandler,
  ConnectionHandler
> = {
  /**
   * Handler used by default
   */
  [DefaultHandler]: async (wsControllerURL, credentials) => {
    const options = generateConnectionOptions(true);
    const instanceCredentials = Auth.instance.determineCredentials(credentials);
    const { conn, logout } = await connectAndLogin(
      wsControllerURL,
      options,
      instanceCredentials,
      CLIENT_VERSION,
    );
    if (!conn) {
      throw new Error(`could not connect to ${wsControllerURL}`);
    }
    return {
      connection: conn,
      onClose: async (): Promise<void> => {
        await new Promise<void>((resolve) => {
          logout((code, cb) => {
            resolve();
            cb(code);
          });
        });
      },
    };
  },
  /*
   * If a URL path is `/api`, then it is a controller.
   */
  "/api": async (wsControllerURL, credentials) => {
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
      const message =
        "Unable to log into the controller, check that the controller address is correct and that it is online.";
      logger.error(message, cause);
      throw new Error(message, { cause });
    });
    if (error) {
      throw new Error(Label.CONTROLLER_LOGIN_ERROR);
    }
    if (!connection) {
      throw new Error("Could not connect to controller");
    }

    return {
      connection,
      onClose: async (): Promise<void> => {
        if (intervalId !== undefined && intervalId !== null) {
          clearInterval(intervalId);
        }
        if (juju) {
          await new Promise<void>((resolve) => {
            juju.logout((code, cb) => {
              resolve();
              cb(code);
            });
          });
        }
      },
    };
  },
};

export class ConnectionManager {
  private connections = new Map<
    string,
    ConnectionResult | Promise<ConnectionWithFacades>
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
    let connection:
      | ConnectionResult
      | Promise<ConnectionWithFacades>
      | undefined = undefined;
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

    await connection.onClose?.();
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

    // Extract the path to determine the connection handler.
    let path = "";
    try {
      const url = new URL(wsControllerURL);
      path = url.pathname;
    } catch (err) {
      logger.warn(
        `invalid URL for connection, falling back on default connection handler`,
        wsControllerURL,
        err,
      );
    }

    // Select an appropriate connection handler.
    const connectionHandler =
      CONNECTION_HANDLERS_BY_PATH[path] ??
      CONNECTION_HANDLERS_BY_PATH[DefaultHandler];

    const connectionResult = await connectionHandler(
      wsControllerURL,
      credentials,
    );
    const { connection } = connectionResult;

    this.connections.set(wsControllerURL, connectionResult);
    connectionPromise.resolve(connection);

    await this.hooks.onConnection?.(wsControllerURL, connection);

    return connection;
  }
}
