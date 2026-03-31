import { createPollingSource } from "data/pollingSource";
import * as appActions from "store/app/actions";
import { actions as jujuActions } from "store/juju";
import { logger } from "utils/logger";

import { ModelsError } from "../model-poller";
import { createSourceMiddleware } from "../source-middleware";

export default createSourceMiddleware(
  "model-list",
  ({ withConnection: _ }: { withConnection: string }, { connection }) => {
    return createPollingSource(
      async () => {
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
    setData: ({ withConnection }, models) =>
      jujuActions.updateModelList({
        models,
        wsControllerURL: withConnection,
      }),
    setError: ({ withConnection }, error) =>
      jujuActions.updateModelsError({
        wsControllerURL: withConnection,
        modelsError: error?.message ?? null,
      }),
    setLoading: ({ withConnection }, loading) =>
      jujuActions.updateModelListLoading({
        wsControllerURL: withConnection,
        loading,
      }),
  },
  {
    after: (_args, store) => {
      store.dispatch(appActions.updateModelStatuses());
    },
  },
);
