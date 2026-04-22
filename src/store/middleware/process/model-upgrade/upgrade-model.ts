import type { FullStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV8";
import type {
  Error as ModelUpgraderError,
  Number as VersionNumber,
} from "@canonical/jujulib/dist/api/facades/model-upgrader/ModelUpgraderV1";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { Source } from "data";
import { createPollingSource } from "data/pollingSource";
import type { ConnectionWithFacades } from "juju/types";
import { actions as jujuActions } from "store/juju";
import { hasConnections } from "store/middleware/connection/middleware";

import { createProcess } from "../createProcess";

const REQUIRED_CONNECTIONS = ["wsControllerURL", "modelURL"];

export type UpgradeStatus =
  | { status: "completed" } // Upgrade complete.
  | { status: "error"; error: ModelUpgraderError } // Error during request.
  | { status: "initiated" } // Response received, polling model version.
  | { status: "pending" }; // Request sent, awaiting response.

type Params = {
  wsControllerURL: string;
  modelUUID: string;
  modelURL: string;
  currentVersion: string;
  targetVersion: VersionNumber;
};

function versionNumberToString(version: VersionNumber): string {
  return `${version.Major}.${version.Minor}.${version.Patch}`;
}

const createModelFullStatusSource = (
  modelConnection: ConnectionWithFacades,
): Source<FullStatus> =>
  createPollingSource(
    async () => {
      const status = await modelConnection.facades.client?.fullStatus({
        patterns: [],
      });

      if (!status) {
        throw new Error("Status not produced");
      }

      return status;
    },
    { interval: { seconds: 5 } },
  );

export default createProcess<Params, UpgradeStatus, void>(
  "model-upgrade/upgrade-model",
  async function* ({
    modelUUID,
    targetVersion,
    meta,
  }): AsyncGenerator<UpgradeStatus, void, void> {
    if (!hasConnections(meta, REQUIRED_CONNECTIONS)) {
      throw new Error("connection not provided");
    }

    const controllerConnection = meta.connections.wsControllerURL;
    const modelConnection = meta.connections.modelURL;

    if (!controllerConnection.facades.modelUpgrader) {
      throw new Error("ModelUpgrader facade not supported");
    }

    const upgradeRequest =
      controllerConnection.facades.modelUpgrader.upgradeModel({
        "model-tag": `model-${modelUUID}`,
        "target-version": targetVersion,
      });
    yield { status: "pending" };

    const upgradeResult = await upgradeRequest;

    if (upgradeResult.error) {
      yield { status: "error", error: upgradeResult.error };
      throw upgradeResult.error;
    }

    yield { status: "initiated" };

    // Poll model for version.
    const targetVersionString = versionNumberToString(targetVersion);
    const source = createModelFullStatusSource(modelConnection);
    for await (const data of source) {
      if (data.model.version === targetVersionString) {
        break;
      }
    }
    source.done();

    // TODO: Emit some useful info here maybe?
    yield { status: "completed" };
  },
  {
    setOutcome: ({ modelUUID }, outcome) => {
      if ("error" in outcome) {
        // TODO: Toast error
        console.log("upgrade error", modelUUID, outcome.error);
      } else {
        console.log("upgrade complete", modelUUID);
      }
      // Nothing is needed with outcome result, so ignore it.
      return {} as PayloadAction;
    },
    setStatus: ({ modelUUID }, status) => {
      // TODO: Toast status
      console.log("upgrade status", modelUUID, status);
      return {} as PayloadAction;
    },
    setRunning: ({ modelUUID, targetVersion, currentVersion }, running) => {
      if (running) {
        return jujuActions.addModelUpgrade({
          modelUUID,
          currentVersion,
          upgradeVersion: versionNumberToString(targetVersion),
        });
      } else {
        return jujuActions.removeModelUpgrade({ modelUUID });
      }
    },
  },
  {
    addActionMeta: (_payload) => ({
      withConnection: true,
      connectionList: REQUIRED_CONNECTIONS,
    }),
  },
);

export { VersionNumber };
