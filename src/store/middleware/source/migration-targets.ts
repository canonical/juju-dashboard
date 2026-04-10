import { createPollingSource } from "data/pollingSource";
import { listMigrationTargets } from "juju/jimm/api";
import { actions as jujuActions } from "store/juju";

import { hasConnection } from "../connection/middleware";
import { createSourceMiddleware } from "../source-middleware";

export default createSourceMiddleware<
  string[],
  { wsControllerURL: string; modelUUID: string }
>(
  "migration-targets",
  ({ wsControllerURL: _, modelUUID: modelUUID, meta }) => {
    if (!hasConnection(meta)) {
      throw new Error("connection not provided");
    }

    const { connection } = meta;

    return createPollingSource(
      async () => {
        const response = await listMigrationTargets(
          connection,
          `model-${modelUUID}`,
        );

        const controllers = [];
        for (const { uuid } of response.controllers) {
          controllers.push(uuid);
        }
        return controllers;
      },
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
