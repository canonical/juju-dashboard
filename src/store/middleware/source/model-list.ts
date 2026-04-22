import { createPollingSource } from "data/pollingSource";
import type { ConnectionWithFacades, UserModelList } from "juju/types";
import * as appActions from "store/app/actions";
import { actions as jujuActions } from "store/juju";
import { logger } from "utils/logger";

import { hasConnections } from "../connection/util";
import { createSourceMiddleware } from "../source-middleware";
import { ModelsError } from "../types";

export const NOT_AUTHENTICATED_ERROR = "not authenticated with controller";

export async function getModelList(
  connection: ConnectionWithFacades,
): Promise<UserModelList> {
  if (!connection.info.user?.identity) {
    throw new Error(NOT_AUTHENTICATED_ERROR);
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
}

export default createSourceMiddleware<
  UserModelList,
  { wsControllerURL: string }
>(
  "model-list",
  ({ meta }) => {
    if (!hasConnections(meta, ["wsControllerURL"])) {
      throw new Error("connection not provided");
    }

    const connection = meta.connections.wsControllerURL;

    return createPollingSource(async () => getModelList(connection), {
      interval: { seconds: 30 },
    });
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
