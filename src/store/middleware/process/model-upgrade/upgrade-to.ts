import { UpgradeToJobState } from "juju/jimm/JIMMV4";
import * as jimmApi from "juju/jimm/api";
import { createToast } from "store/app/actions";
import { actions as jujuActions } from "store/juju";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";
import { hasConnections } from "store/middleware/connection/util";
import createModelControllerInfoSource from "store/middleware/source/model-controller-info";
import modelList from "store/middleware/source/model-list";
import { logger } from "utils/logger";

import { createProcess } from "../createProcess";

enum UpgradeStatus {
  INITIATED = "initiated",
  LOADING = "loading",
  PENDING = "pending",
}

type UpgradeState = {
  status: UpgradeStatus;
};

const REQUIRED_CONNECTIONS = ["wsControllerURL"];
/**
 * Number of poll requests between each toast.
 */
const STATUS_TOAST_INTERVAL = 5;

type Params = {
  wsControllerURL: string;
  modelName: string;
  modelUUID: string;
  currentVersion: string;
  targetVersion: string;
  targetController: string;
};

export async function* upgradeTo(
  modelUUID: string,
  targetController: string,
  controllerConnection: ManagedConnection,
): AsyncGenerator<UpgradeState, void, void> {
  const request = jimmApi.upgradeTo(
    controllerConnection,
    [modelUUID],
    targetController,
  );
  yield { status: UpgradeStatus.PENDING };
  const result = await request;

  if (result.results[0]?.error) {
    throw new Error("migration request rejected");
  }

  yield { status: UpgradeStatus.INITIATED };

  // Poll the model controller info for the upgrade-to job status.
  const infoSource = createModelControllerInfoSource(
    controllerConnection,
    modelUUID,
  );
  let statusCount = 0;
  for await (const response of infoSource) {
    const state = response["upgrade-to-job-status"]?.detail.state;
    if (
      state === UpgradeToJobState.CANCELLED ||
      state === UpgradeToJobState.DISCARDED
    ) {
      infoSource.done();
      throw new Error("Upgrade failed");
    }
    if (state === UpgradeToJobState.COMPLETED) {
      // The upgrade job finished successfully so the source can now finish.
      break;
    }
    // In-progress (or the job hasn't appeared yet) — send a toast to inform the
    // user that it's still running.
    statusCount += 1;
    if (statusCount % STATUS_TOAST_INTERVAL === 0) {
      yield { status: UpgradeStatus.LOADING };
    }
  }
  infoSource.done();
}

export default createProcess<Params, UpgradeState, void>(
  "model-upgrade/upgrade-to",
  async function* ({
    modelUUID,
    targetController,
    meta,
  }): AsyncGenerator<UpgradeState, void, void> {
    if (!hasConnections(meta, REQUIRED_CONNECTIONS)) {
      throw new Error("missing connections");
    }

    const controllerConnection = meta.connections.wsControllerURL;
    return yield* upgradeTo(modelUUID, targetController, controllerConnection);
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
