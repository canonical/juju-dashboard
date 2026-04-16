import type { FullStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV8";
import type { Error as ModelUpgraderError } from "@canonical/jujulib/dist/api/facades/model-upgrader/ModelUpgraderV1";

import type { Source } from "data";
import { createPollingSource } from "data/pollingSource";
import type { ConnectionWithFacades } from "juju/types";
import { hasConnections } from "store/middleware/connection/middleware";

const REQUIRED_CONNECTIONS = ["wsControllerURL", "modelURL"] as const;

type UpgradeStatus =
  | { status: "completed" } // Upgrade complete.
  | { status: "error"; error: ModelUpgraderError } // Error during request.
  | { status: "initiated" } // Response received, polling model version.
  | { status: "pending" }; // Request sent, awaiting response.

type Params = {
  wsControllerURL: string;
  modelUUID: string;
  modelURL: string;
  targetVersion: string;
  meta: Record<string, unknown>;
};

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

export default createProcess(
  "model-upgrade/upgrade-model",
  async function* ({
    wsControllerURL,
    modelUUID,
    modelURL,
    targetVersion,
    meta,
  }: Params): AsyncGenerator<UpgradeStatus, void, void> {
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
    const source = createModelFullStatusSource(modelConnection);
    for await (const data of source) {
      if (data.model.version === targetVersion) {
        break;
      }
    }
    source.done();

    // TODO: Emit some useful info here maybe?
    yield { status: "completed" };
  },
  {
    addActionMeta: (_payload) => ({
      withConnection: true,
      connectionList: REQUIRED_CONNECTIONS,
    }),
  },
);
