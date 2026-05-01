import type { PayloadAction } from "@reduxjs/toolkit";

import * as jimmApi from "juju/jimm/api";
import { createToast } from "store/app/actions";
import { actions as jujuActions } from "store/juju";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";
import { hasConnections } from "store/middleware/connection/util";
import modelList from "store/middleware/source/model-list";
import { logger } from "utils/logger";

import { createProcess } from "../createProcess";

import createModelConnectionRetrySource from "./model-connection-retry-source";

export type UpgradeStatus =
  | { status: "initiated" }
  | { status: "loading" }
  | { status: "pending" }
  | { status: "reconnecting" };

const REQUIRED_CONNECTIONS = ["wsControllerURL", "modelURL"];
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
    setOutcome: ({ modelUUID, modelName, targetVersion }, outcome) => {
      if ("error" in outcome) {
        logger.error(
          "An error occurred during model upgrade",
          modelUUID,
          outcome.error,
        );
        return createToast({
          message: `Error during upgrade of "${modelName}": ${outcome.error.message}`,
          severity: "negative",
        });
      } else {
        return createToast({
          message: `Model "${modelName}" upgraded to ${targetVersion}`,
          severity: "positive",
        });
      }
    },
    setStatus: ({ modelUUID, modelName }, status) => {
      let message: string | undefined = undefined;
      switch (status.status) {
        case "pending":
          logger.info(`${modelName} (${modelUUID}) upgrade pending`);
          message = `Upgrading model "${modelName}"…`;
          break;
        case "initiated":
          logger.info(`${modelName} (${modelUUID}) upgrade initiated`);
          break;
        case "loading":
          logger.info(`${modelName} (${modelUUID}) upgrade loading`);
          break;
        case "reconnecting":
          logger.info(`Attempting to reconnect to ${modelName} (${modelUUID})`);
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
