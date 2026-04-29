import type { FullStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV8";

import type { Source } from "data";
import { createPollingSource } from "data/pollingSource";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";
import { logger } from "utils/logger";

/**
 * Timeout in seconds to poll the model status.
 */
const MODEL_STATUS_POLL_S = 5;

export default function createModelConnectionRetrySource(
  modelConnection: ManagedConnection,
): Source<{ reconnecting: true } | { version: string }> {
  let connection: ManagedConnection | null = modelConnection;
  return createPollingSource(
    async () => {
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (!connection) {
        connection = await modelConnection.reconnect();
      }

      let status: FullStatus | undefined = undefined;
      try {
        status = await connection.facades.client?.fullStatus({
          patterns: [],
        });
      } catch (error) {
        // Client throws an error if the socket is closed. Begin reconnecting.
        logger.warn("caught error, assuming disconnected", error);
        connection = null;
        return { reconnecting: true };
      }

      if (!status) {
        throw new Error("Status not produced");
      }

      return { version: status.model.version };
    },
    { interval: { seconds: MODEL_STATUS_POLL_S } },
  );
}
