import type { FullStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV8";
import type { PayloadAction } from "@reduxjs/toolkit";

import { createPollingSource } from "data/pollingSource";
import type { Source } from "data/source";
import * as jimmApi from "juju/jimm/api";
import { createToast } from "store/app/actions";
import { actions as jujuActions } from "store/juju";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";
import { hasConnections } from "store/middleware/connection/util";
import modelList from "store/middleware/source/model-list";
import { logger } from "utils/logger";

import { createProcess } from "../createProcess";

export type UpgradeStatus =
  | { status: "initiated" }
  | { status: "loading" }
  | { status: "pending" }
  | { status: "reconnecting" };

const REQUIRED_CONNECTIONS = ["wsControllerURL", "modelURL"];
/**
 * Timeout in seconds to poll the model status.
 */
const MODEL_STATUS_POLL_S = 5;
/**
 * Number of poll requests between each toast.
 */
const STATUS_TOAST_INTERVAL = 5;

type Params = {
  wsControllerURL: string;
  modelName: string;
  modelUUID: string;
  modelURL: string;
  currentVersion: string;
  targetVersion: string;
  targetController: string;
};

export function createModelConnectionRetrySource(
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

export async function* upgradeTo(
  modelUUID: string,
  targetController: string,
  targetVersion: string,
  controllerConnection: ManagedConnection,
  modelConnection: ManagedConnection,
): AsyncGenerator<UpgradeStatus, void, void> {
  const modelTag = `model-${modelUUID}`;

  const request = jimmApi.upgradeTo(
    controllerConnection,
    modelTag,
    targetController,
  );
  yield { status: "pending" };
  const result = await request;

  if (!result) {
    throw new Error("migration request rejected");
  }

  yield { status: "initiated" };

  // Poll for model version.
  const source = createModelConnectionRetrySource(modelConnection);
  let statusCount = 0;
  for await (const retry of source) {
    if ("version" in retry) {
      if (retry.version === targetVersion) {
        break;
      }
      // Send a toast to to inform the user that it's in progress.
      statusCount += 1;
      if (statusCount % STATUS_TOAST_INTERVAL === 0) {
        yield { status: "loading" };
      }
    } else {
      statusCount = 0;
      yield { status: "reconnecting" };
    }
  }
  source.done();
}

export default createProcess<Params, UpgradeStatus, void>(
  "model-upgrade/upgrade-to",
  async function* ({
    modelUUID,
    targetController,
    targetVersion,
    meta,
  }): AsyncGenerator<UpgradeStatus, void, void> {
    if (!hasConnections(meta, REQUIRED_CONNECTIONS)) {
      throw new Error("missing connections");
    }

    const controllerConnection = meta.connections.wsControllerURL;
    const modelConnection = meta.connections.modelURL;

    return yield* upgradeTo(
      modelUUID,
      targetController,
      targetVersion,
      controllerConnection,
      modelConnection,
    );
  },
  {
    setOutcome: (
      { modelUUID, modelName, targetController, targetVersion },
      outcome,
    ) => {
      if ("error" in outcome) {
        logger.error(
          "An error occurred during model upgrade",
          modelUUID,
          outcome.error,
        );
        return createToast({
          message: `Error during upgrade of '${modelName}': ${outcome.error.message}`,
          severity: "negative",
        });
      } else {
        return createToast({
          message: `Upgrade of '${modelName}' to version ${targetVersion} on ${targetController} completed.`,
          severity: "positive",
        });
      }
    },
    setStatus: ({ modelUUID, modelName }, status) => {
      let message: string | undefined = undefined;
      switch (status.status) {
        case "pending":
          message = `Upgrade of '${modelName}' requested`;
          break;
        case "initiated":
          message = `Upgrade of '${modelName}' initiated`;
          break;
        case "loading":
          message = `Upgrade of '${modelName}' in progress`;
          break;
        case "reconnecting":
          message = `Attempting to reconnect to '${modelName}'`;
          break;
        default:
          logger.warn("An unknown status was emitted", modelUUID, status);
          break;
      }

      if (!message) {
        // Don't toast anything if there's no message.
        return {} as PayloadAction;
      }

      return createToast({ message, severity: "information" });
    },
    setRunning: ({ modelUUID, targetVersion, currentVersion }, running) => {
      if (running) {
        return jujuActions.addModelUpgrade({
          modelUUID,
          currentVersion,
          upgradeVersion: targetVersion,
        });
      } else {
        return jujuActions.removeModelUpgrade({ modelUUID });
      }
    },
  },
  {
    addActionMeta: () => ({
      withConnection: true,
      connectionList: REQUIRED_CONNECTIONS,
    }),
    after: ({ wsControllerURL }, dispatch) => {
      dispatch(modelList.actions.invalidate({ wsControllerURL }));
    },
  },
);
