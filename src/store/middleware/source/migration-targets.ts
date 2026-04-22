import { createPollingSource } from "data/pollingSource";
import { listMigrationTargets } from "juju/jimm/api";
import type { ConnectionWithFacades } from "juju/types";
import { actions as jujuActions } from "store/juju";

import { hasConnections } from "../connection/util";
import { createSourceMiddleware } from "../source-middleware";

export async function getMigrationTargets(
  connection: ConnectionWithFacades,
  modelUUID: string,
): Promise<string[]> {
  const response = await listMigrationTargets(connection, `model-${modelUUID}`);

  const controllers = [];
  for (const { uuid } of response.controllers) {
    controllers.push(uuid);
  }
  return controllers;
}

export default createSourceMiddleware<
  string[],
  { wsControllerURL: string; modelUUID: string }
>(
  "migration-targets",
  ({ wsControllerURL: _, modelUUID, meta }) => {
    if (!hasConnections(meta, ["wsControllerURL"])) {
      throw new Error("connection not provided");
    }

    const connection = meta.connections.wsControllerURL;

    return createPollingSource(
      async () => getMigrationTargets(connection, modelUUID),
      { interval: { seconds: 30 } },
    );
  },
  {
    setData: ({ modelUUID }, data) =>
      jujuActions.updateModelMigrationTargets({
        modelUUID,
        update: { data },
      }),
    setError: ({ modelUUID }, error) =>
      jujuActions.updateModelMigrationTargets({ modelUUID, update: { error } }),
    setLoading: ({ modelUUID }, loading) =>
      jujuActions.updateModelMigrationTargets({
        modelUUID,
        update: { loading },
      }),
  },
  {
    addActionMeta: (_payload) => ({ withConnection: true }),
  },
);
