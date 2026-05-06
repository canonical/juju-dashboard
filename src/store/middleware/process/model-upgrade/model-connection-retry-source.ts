import type { FullStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV8";

import type { Source } from "data";
import { createPollingSource } from "data/pollingSource";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";
import { logger } from "utils/logger";

/**
 * Timeout in seconds to poll the model status.
 */
const MODEL_STATUS_POLL_S = 5;

type ConnectionRetryResult = { reconnecting: true } | { version: string };

/**
 * Internal logic for `createModelConnectionRetrySource`.
 *
 * Saves a connection, and whenever the returned function is called, it will try to call the
 * `fullStatus` facade method. If the call fails, it will clear the connection, and attempt to
 * reconnect on the next call.
 */
export function createModelConnectionRetry(modelConnection: ManagedConnection) {
  // A promise which will resolve to the current connection, or `null` if a connection needs to be
  // initiated.
  let connection: null | Promise<ManagedConnection> =
    Promise.resolve(modelConnection);

  return async (): Promise<ConnectionRetryResult> => {
    // Only initiate a connection if there isn't an existing one.
    connection ??= modelConnection.reconnect();

    let currentConnection: ManagedConnection | null = null;
    try {
      currentConnection = await connection;
    } catch (error) {
      logger.warn("caught error, assuming reconnecting", error);
      connection = null;
      return { reconnecting: true };
    }

    if (!currentConnection.facades.client) {
      throw new Error("missing client facade on connection");
    }

    let status: FullStatus | undefined = undefined;
    try {
      status = await currentConnection.facades.client.fullStatus({
        patterns: [],
      });
    } catch (error) {
      // Client throws an error if the socket is closed. Begin reconnecting.
      logger.warn("caught error, assuming disconnected", error);
      connection = null;
      return { reconnecting: true };
    }

    return { version: status.model.version };
  };
}

/**
 * A source which will produce the version of a model, or an indication that it's being reconnected
 * to.
 */
export default function createModelConnectionRetrySource(
  modelConnection: ManagedConnection,
): Source<ConnectionRetryResult> {
  return createPollingSource(createModelConnectionRetry(modelConnection), {
    interval: { seconds: MODEL_STATUS_POLL_S },
  });
}
