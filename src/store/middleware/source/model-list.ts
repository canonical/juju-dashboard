import { createPollingSource } from "data/pollingSource";
import * as appActions from "store/app/actions";
import { actions as jujuActions } from "store/juju";
import { logger } from "utils/logger";

import { controllers, ModelsError } from "../model-poller";
import { createSourceMiddleware } from "../source-middleware";

export default createSourceMiddleware(
  "model-list",
  ({ wsControllerURL }: { wsControllerURL: string }) => {
    return createPollingSource(
      async () => {
        const conn = controllers.get(wsControllerURL);
        if (!conn?.info.user?.identity) {
          throw new Error("not authenticated with controller");
        }

        try {
          const models = (await conn.facades.modelManager?.listModels({
            tag: conn.info.user.identity,
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
      jujuActions.updateModelListLoading({ wsControllerURL, loading }),
  },
  {
    after: (_args, store) => {
      store.dispatch(appActions.updateModelStatuses());
    },
  },
);
