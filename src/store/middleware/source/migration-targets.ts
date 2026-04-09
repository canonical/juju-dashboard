import { createPollingSource } from "data/pollingSource";
import { listMigrationTargets } from "juju/jimm/api";
import { actions as jujuActions } from "store/juju";

import { hasConnection } from "../connection/middleware";
import { createSourceMiddleware } from "../source-middleware";

export default createSourceMiddleware<
  string[],
  { wsControllerURL: string; modelUuid: string }
>(
  "migration-targets",
  ({ wsControllerURL: _, modelUuid: modelTag, meta }) => {
    if (!hasConnection(meta)) {
      throw new Error("connection not provided");
    }

    const { connection } = meta;

    return createPollingSource(
      async () => {
        const response = await listMigrationTargets(connection, modelTag);

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
    setData: ({ modelUuid }, data) =>
      jujuActions.updateModelMigrationTargets({ modelUuid, update: { data } }),
    setError: ({ modelUuid }, error) =>
      jujuActions.updateModelMigrationTargets({ modelUuid, update: { error } }),
    setLoading: ({ modelUuid }, loading) =>
      jujuActions.updateModelMigrationTargets({
        modelUuid,
        update: { loading },
      }),
  },
  {
    addActionMeta: (_payload) => ({ withConnection: true }),
  },
);
