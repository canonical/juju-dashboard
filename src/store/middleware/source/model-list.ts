import { createPollingSource } from "data/pollingSource";
import type { UserModelList } from "juju/types";
import * as appActions from "store/app/actions";
import { actions as jujuActions } from "store/juju";
import { logger } from "utils/logger";

import { hasConnection } from "../connection/middleware";
import { ModelsError } from "../model-poller";
import { createSourceMiddleware } from "../source-middleware";

export default createSourceMiddleware<
  UserModelList,
  { wsControllerURL: string }
>(
  "model-list",
  ({ wsControllerURL: _, meta }) => {
    return createPollingSource(
      async () => {
        if (!hasConnection(meta)) {
          throw new Error("connection not provided");
        }

        const { connection } = meta;

        if (!connection?.info.user?.identity) {
          throw new Error("not authenticated with controller");
        }

        try {
          const models = (await connection.facades.modelManager?.listModels({
            tag: connection.info.user.identity,
          })) ?? { "user-models": [] };
          return models;
        } catch (listError) {
          const errorMessage = ModelsError.LIST_OR_UPDATE_MODELS;
          logger.error(errorMessage, listError);
          throw new Error(errorMessage);
        }
      },
      { interval: { seconds: 30 } },
    );
  },
  {
    setData: ({ wsControllerURL }, models) =>
      jujuActions.updateModelList({
        models,
        wsControllerURL,
      }),
    setError: ({ wsControllerURL }, error) =>
      jujuActions.updateModelsError({
        wsControllerURL,
        modelsError: error?.message ?? null,
      }),
    setLoading: ({ wsControllerURL }, loading) =>
      jujuActions.updateModelListLoading({
        wsControllerURL,
        loading,
      }),
  },
  {
    // Add `withConnection` to every action, to ensure that the connection is always provided.
    addActionMeta: (_payload) => ({ withConnection: true }),
    after: (_args, store) => {
      store.dispatch(appActions.updateModelStatuses());
    },
  },
);
