import createSourceRaceIterator from "data/sourceRaceIterator";
import { JobStatus, type JobInfoResponse } from "juju/jimm/JIMMV4";
import * as jimmApi from "juju/jimm/api";
import { createToast } from "store/app/actions";
import { actions as jujuActions } from "store/juju";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";
import { hasConnections } from "store/middleware/connection/util";
import modelList from "store/middleware/source/model-list";
import { logger } from "utils/logger";

import { createProcess } from "../createProcess";

import createJobInfoSource from "./job-info-source";
import type { ConnectionRetryResult } from "./model-connection-retry-source";
import createModelConnectionRetrySource from "./model-connection-retry-source";

enum UpgradeStatus {
  INITIATED = "initiated",
  LOADING = "loading",
  PENDING = "pending",
  RECONNECTING = "reconnecting",
}

type UpgradeState = {
  status: UpgradeStatus;
};

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
): AsyncGenerator<UpgradeState, void, void> {
  const modelTag = `model-${modelUUID}`;

  const request = jimmApi.upgradeTo(
    controllerConnection,
    modelTag,
    targetController,
  );
  yield { status: UpgradeStatus.PENDING };
  const result = await request;

  if (!result.success) {
    throw new Error("migration request rejected");
  }

  yield { status: UpgradeStatus.INITIATED };

  // Poll for model version.
  const versionSource = createModelConnectionRetrySource(modelConnection);
  const jobInfoSource = createJobInfoSource(
    controllerConnection,
    result["job-id"].toString(),
  );
  let statusCount = 0;
  const sources = createSourceRaceIterator<
    ConnectionRetryResult | JobInfoResponse
  >([versionSource, jobInfoSource], true);
  for await (const response of sources) {
    if ("status" in response) {
      if (response.status === JobStatus.FAILED) {
        versionSource.done();
        jobInfoSource.done();
        throw new Error("Upgrade failed");
      }
    }
    if ("version" in response) {
      if (response.version === targetVersion) {
        // The model has reached the target version so the source can now finish.
        break;
      }
      // Send a toast to to inform the user that it's in progress.
      statusCount += 1;
      if (statusCount % STATUS_TOAST_INTERVAL === 0) {
        yield { status: UpgradeStatus.LOADING };
      }
    } else {
      statusCount = 0;
      yield { status: UpgradeStatus.RECONNECTING };
    }
  }
  versionSource.done();
  jobInfoSource.done();
}

export default createProcess<Params, UpgradeState, void>(
  "model-upgrade/upgrade-to",
  async function* ({
    modelUUID,
    targetController,
    targetVersion,
    meta,
  }): AsyncGenerator<UpgradeState, void, void> {
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
          message: `Failed to upgrade. Model "${modelName}" has not been migrated or upgraded. Try again or contact support.`,
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
      let message: null | string = null;
      switch (status.status) {
        case UpgradeStatus.PENDING:
          logger.debug(`${modelName} (${modelUUID}) upgrade pending`);
          message = `Upgrading model "${modelName}"…`;
          break;
        case UpgradeStatus.INITIATED:
          logger.debug(`${modelName} (${modelUUID}) upgrade initiated`);
          break;
        case UpgradeStatus.LOADING:
          logger.debug(`${modelName} (${modelUUID}) upgrade loading`);
          break;
        case UpgradeStatus.RECONNECTING:
          logger.debug(
            `Attempting to reconnect to ${modelName} (${modelUUID})`,
          );
          break;
        default:
          logger.warn("An unknown status was emitted", modelUUID, status);
          break;
      }

      if (!message) {
        // Don't toast anything if there's no message.
        return;
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
