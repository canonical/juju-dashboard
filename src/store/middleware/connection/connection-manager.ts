import type { Client } from "@canonical/jujulib";

import { Auth } from "auth";
import { loginWithBakery } from "juju/api";
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
