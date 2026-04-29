import { unwrapResult } from "@reduxjs/toolkit";
import { isAction, type Middleware } from "redux";

import {
  fetchAndStoreModelStatus,
  fetchControllerList,
  fetchModelInfo,
  setModelSharingPermissions,
} from "juju/api";
import {
  checkRelation,
  checkRelations,
  crossModelQuery,
  findAuditEvents,
} from "juju/jimm/api";
import type { DestroyModelErrors } from "juju/types";
import { DisableType } from "pages/AddModel/ConfigsConstraints/types";
import { actions as appActions, thunks as appThunks } from "store/app";
import { updateModelStatuses } from "store/app/actions";
import { actions as generalActions } from "store/general";
import { isLoggedIn } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { getModelList } from "store/juju/selectors";
import { addControllerCloudRegion } from "store/juju/thunks";
import type { RootState, Store } from "store/store";
import { isSpecificAction } from "types";
import { toErrorString } from "utils";
import { logger } from "utils/logger";

import {
  createConnectionMiddleware,
  type ConnectionManager,
} from "./connection";
import { disableCommand } from "./process";
import cloudInfoMiddleware from "./source/cloud-info";
import modelListMiddleware from "./source/model-list";
import { ModelsError } from "./types";

export enum LoginError {
  LOG = "Unable to log into controller.",
  NO_INFO = "Unable to retrieve controller details.",
  WHOAMI = "Unable to check authentication status. You can attempt to log in anyway.",
}

function runModelPoller(
  reduxStore: Parameters<Middleware<void, RootState, Store["dispatch"]>>[0],
  connections: ConnectionManager,
  next: (action: unknown) => unknown,
) {
  return async (action: unknown): Promise<unknown> => {
    if (!isAction(action)) {
      return next(action);
    }
    if (
      isSpecificAction<ReturnType<typeof appActions.connectAndPollControllers>>(
        action,
        appActions.connectAndPollControllers.type,
      )
    ) {
      // Each time we try to log in to a controller we get new macaroons, so
      // first clean up any old auth requests:
      reduxStore.dispatch(generalActions.clearVisitURLs());
      for (const [wsControllerURL, _credentials] of action.payload
        .controllers) {
        reduxStore.dispatch(generalActions.updateLoginLoading(true));
        let conn = undefined;
        try {
          conn = await connections.get(wsControllerURL);

          if (!conn.info || Object.keys(conn.info).length === 0) {
            throw new Error(LoginError.NO_INFO);
          }
        } catch (error) {
          reduxStore.dispatch(
            generalActions.storeLoginError({
              wsControllerURL,
              error: toErrorString(error),
            }),
          );
          continue;
        } finally {
          reduxStore.dispatch(generalActions.updateLoginLoading(false));
        }

        reduxStore.dispatch(
          cloudInfoMiddleware.actions.start({
            wsControllerURL,
          }),
        );
        await fetchControllerList(
          wsControllerURL,
          conn,
          reduxStore.dispatch,
          reduxStore.getState,
        );

        reduxStore.dispatch(
          modelListMiddleware.actions.start({
            wsControllerURL,
          }),
        );
      }

      return;
    } else if (action.type === updateModelStatuses.type) {
      const modelList = Object.entries(getModelList(reduxStore.getState()));
      let errorCount = 0;
      let lastErrorWSController = null;
      for (const [modelUUID, { wsControllerURL }] of modelList) {
        const conn = await connections.get(wsControllerURL);
        if (!conn || !isLoggedIn(reduxStore.getState(), wsControllerURL)) {
          continue;
        }
        try {
          await fetchAndStoreModelStatus(
            modelUUID,
            wsControllerURL,
            reduxStore.dispatch,
            reduxStore.getState,
          );
          if (!isLoggedIn(reduxStore.getState(), wsControllerURL)) {
            // The user may have logged out while the previous call was in
            // progress.
            continue;
          }
          const modelInfo = await fetchModelInfo(conn, [modelUUID]);
          if (!modelInfo) {
            continue;
          }
          reduxStore.dispatch(
            jujuActions.updateModelInfo({
              modelInfo,
              wsControllerURL,
            }),
          );
          if (!isLoggedIn(reduxStore.getState(), wsControllerURL)) {
            // The user may have logged out while the previous call was in
            // progress.
            continue;
          }
          if (modelInfo?.results[0].result?.["is-controller"]) {
            // If this is a controller model then update the
            // controller data with this model data.
            reduxStore
              .dispatch(
                addControllerCloudRegion({ wsControllerURL, modelInfo }),
              )
              .then(unwrapResult)
              .catch((error) =>
                // Not shown in UI. Logged for debugging purposes.
                {
                  logger.error(
                    "Error when trying to add controller cloud and region data.",
                    error,
                  );
                },
              );
          }
        } catch (error) {
          errorCount += 1;
          lastErrorWSController = wsControllerURL;
        }
      }

      if (lastErrorWSController && errorCount >= 0.1 * modelList.length) {
        const modelsError =
          errorCount === modelList.length
            ? ModelsError.LOAD_ALL_MODELS
            : ModelsError.LOAD_SOME_MODELS;

        reduxStore.dispatch(
          jujuActions.updateModelsError({
            modelsError,
            wsControllerURL: lastErrorWSController,
          }),
        );
      } else {
        // Clear errors for all controllers.
        const allControllers = modelList.reduce<string[]>(
          (controllerURLs, [_, { wsControllerURL }]) => {
            if (!controllerURLs.includes(wsControllerURL)) {
              controllerURLs.push(wsControllerURL);
            }
            return controllerURLs;
          },
          [],
        );
        for (const wsControllerURL of allControllers) {
          reduxStore.dispatch(
            jujuActions.updateModelsError({
              modelsError: null,
              wsControllerURL,
            }),
          );
        }
      }
      return;
    } else if (action.type === appThunks.logOut.pending.type) {
      for (const wsControllerURL of connections) {
        reduxStore.dispatch(
          modelListMiddleware.actions.stop({
            wsControllerURL,
          }),
        );
        void connections.logout(wsControllerURL);
      }
      return next(action);
    } else if (
      isSpecificAction<ReturnType<typeof appActions.updatePermissions>>(
        action,
        appActions.updatePermissions.type,
      )
    ) {
      const { payload } = action;
      const conn = await connections.get(payload.wsControllerURL);
      const response = await setModelSharingPermissions(
        payload.wsControllerURL,
        payload.modelUUID,
        conn,
        payload.user,
        payload.permissionTo,
        payload.permissionFrom,
        payload.action,
        reduxStore.dispatch,
      );
      return response;
    } else if (
      isSpecificAction<ReturnType<typeof jujuActions.fetchAuditEvents>>(
        action,
        jujuActions.fetchAuditEvents.type,
      )
    ) {
      // Intercept fetchAuditEvents actions and fetch and store audit events via the
      // controller connection.
      const { wsControllerURL, ...params } = action.payload;
      // Immediately pass the action along so that it can be handled by the
      // reducer to update the loading state.
      next(action);
      const conn = await connections
        .get(wsControllerURL)
        .catch((_err) => undefined);
      if (!conn) {
        return;
      }
      try {
        const auditEvents = await findAuditEvents(conn, params);
        reduxStore.dispatch(jujuActions.updateAuditEvents(auditEvents.events));
      } catch (error) {
        logger.error("Could not fetch audit events.", error);
        reduxStore.dispatch(
          jujuActions.updateAuditEventsErrors(toErrorString(error)),
        );
      }
      // The action has already been passed to the next middleware at the top of
      // this handler.
      return;
    } else if (
      isSpecificAction<ReturnType<typeof jujuActions.fetchCrossModelQuery>>(
        action,
        jujuActions.fetchCrossModelQuery.type,
      )
    ) {
      // Intercept fetchCrossModelQuery actions and fetch and store
      // cross model query via the controller connection.
      const { wsControllerURL, query } = action.payload;
      // Immediately pass the action along so that it can be handled by the
      // reducer to update the loading state.
      next(action);
      const conn = await connections
        .get(wsControllerURL)
        .catch((_err) => undefined);

      if (!conn) {
        return;
      }
      try {
        const crossModelQueryResponse = await crossModelQuery(conn, query);
        reduxStore.dispatch(
          Object.keys(crossModelQueryResponse.errors).length
            ? jujuActions.updateCrossModelQueryErrors(
                crossModelQueryResponse.errors,
              )
            : jujuActions.updateCrossModelQueryResults(
                crossModelQueryResponse.results,
              ),
        );
      } catch (error) {
        logger.error("Could not perform cross model query.", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to perform search. Please try again later.";
        reduxStore.dispatch(
          jujuActions.updateCrossModelQueryErrors(errorMessage),
        );
      }
      // The action has already been passed to the next middleware
      // at the top of this handler.
      return;
    } else if (
      isSpecificAction<ReturnType<typeof jujuActions.checkRelation>>(
        action,
        jujuActions.checkRelation.type,
      )
    ) {
      // Intercept checkRelation actions and fetch and store
      // the relation via the controller connection.
      const { wsControllerURL, tuple } = action.payload;
      // Immediately pass the action along so that it can be handled by the
      // reducer to update the loading state.
      next(action);
      const conn = await connections
        .get(wsControllerURL)
        .catch((_err) => undefined);
      if (!conn) {
        return;
      }
      try {
        const response = await checkRelation(conn, tuple);
        reduxStore.dispatch(
          "error" in response
            ? jujuActions.addCheckRelationErrors({
                tuple,
                errors: response.error,
              })
            : jujuActions.addCheckRelation({
                tuple,
                allowed: response.allowed,
              }),
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Could not check permissions.";
        reduxStore.dispatch(
          jujuActions.addCheckRelationErrors({ tuple, errors: errorMessage }),
        );
      }
      // The action has already been passed to the next middleware
      // at the top of this handler.
      return;
    } else if (
      isSpecificAction<ReturnType<typeof jujuActions.checkRelations>>(
        action,
        jujuActions.checkRelations.type,
      )
    ) {
      // Intercept checkRelations actions and fetch and store
      // the tuples via the controller connection.
      const { wsControllerURL, tuples } = action.payload;
      // Immediately pass the action along so that it can be handled by the
      // reducer to update the loading state.
      next(action);
      const conn = await connections
        .get(wsControllerURL)
        .catch((_err) => undefined);
      if (!conn) {
        return;
      }
      try {
        const response = await checkRelations(conn, tuples);
        reduxStore.dispatch(
          jujuActions.addCheckRelations({
            requestId: action.payload.requestId,
            tuples,
            permissions: response.results,
          }),
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Could not check relations.";
        reduxStore.dispatch(
          jujuActions.addCheckRelationsErrors({
            requestId: action.payload.requestId,
            tuples,
            errors: errorMessage,
          }),
        );
      }
      // The action has already been passed to the next middleware
      // at the top of this handler.
      return;
    } else if (
      isSpecificAction<ReturnType<typeof jujuActions.destroyModels>>(
        action,
        jujuActions.destroyModels.type,
      )
    ) {
      // Intercept destroyModel actions and fetch and store
      // the models via the controller connection.
      const { wsControllerURL, models } = action.payload;
      // Immediately pass the action along so that it can be handled by the
      // reducer to update the loading state.
      next(action);
      const conn = await connections
        .get(wsControllerURL)
        .catch((_err) => undefined);
      if (!conn) {
        return;
      }
      let remainingModels: string[] = [];
      const destroyModelErrors: DestroyModelErrors = [];

      try {
        const result = await conn.facades.modelManager?.destroyModels({
          models,
        });
        result?.results.forEach((errorResult, index) => {
          if (errorResult.error) {
            destroyModelErrors.push([
              models[index].modelUUID,
              errorResult.error.message,
            ]);
          } else {
            remainingModels.push(models[index].modelUUID);
          }
        });
      } catch (error) {
        logger.error("Could not destroy model", error);
        const errorMessages = models.map(({ modelUUID }) => [
          modelUUID,
          "Something went wrong during the model destruction process",
        ]);

        reduxStore.dispatch(
          jujuActions.destroyModelErrors({
            errors: errorMessages,
          }),
        );
      }

      // Dispatch partial errors, if any, and continue with successful destructions
      if (destroyModelErrors.length > 0) {
        reduxStore.dispatch(
          jujuActions.destroyModelErrors({ errors: destroyModelErrors }),
        );
      }

      // Only proceed to check for completion if at least one model had no errors
      if (destroyModelErrors.length < models.length) {
        reduxStore.dispatch(
          jujuActions.updateDestroyModelsLoading({
            modelUUIDs: remainingModels,
            wsControllerURL,
          }),
        );

        let isDestructionComplete = false;
        do {
          const modelInfos = await fetchModelInfo(conn, remainingModels);

          // Get the list of models that are not destroyed yet
          const destroyedModels =
            modelInfos?.results.reduce<string[]>((acc, info, index) => {
              if (!info.result?.life) {
                acc.push(remainingModels[index]);
              }
              return acc;
            }, []) ?? [];

          if (destroyedModels.length === remainingModels.length) {
            isDestructionComplete = true;
            reduxStore.dispatch(
              jujuActions.updateModelsDestroyed({
                modelUUIDs: remainingModels,
                wsControllerURL,
              }),
            );
            break;
          }

          if (destroyedModels.length > 0) {
            reduxStore.dispatch(
              jujuActions.updateModelsDestroyed({
                modelUUIDs: destroyedModels,
                wsControllerURL,
              }),
            );
          }
          remainingModels = remainingModels.filter(
            (modelUUID) => !destroyedModels.includes(modelUUID),
          );

          // TODO: Clear this timeout. Refer: WD-29374
          // Wait 10s then start again.
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(true);
            }, 10000);
          });
        } while (remainingModels.length > 0 && !isDestructionComplete);
      }
      // The action has already been passed to the next middleware
      // at the top of this handler.
      return;
    } else if (
      isSpecificAction<ReturnType<typeof jujuActions.addModel>>(
        action,
        jujuActions.addModel.type,
      )
    ) {
      // Intercept addModel actions and fetch and store
      // the cloud information via the controller connection.
      const {
        wsControllerURL,
        modelName,
        cloudTag,
        credential,
        region,
        userTag,
        disabledCommands,
      } = action.payload;
      // Immediately pass the action along so that it can be handled by the
      // reducer to update the loading state.

      next(action);
      const conn = await connections
        .get(wsControllerURL)
        .catch((_err) => undefined);
      if (!conn) {
        return;
      }
      try {
        if (!conn.facades.modelManager) {
          throw new Error("Unsupported facade: modelManager");
        }
        const response = await conn.facades.modelManager?.createModel({
          qualifier: userTag, // ModelManagerV11 requires `qualifier`.
          "owner-tag": userTag, // Versions prior to ModelManagerV11 require `owner-tag`.
          name: modelName,
          "cloud-tag": cloudTag,
          credential,
          region,
        });

        if (response) {
          if ("error" in response) {
            throw response.error;
          } else if (
            disabledCommands !== DisableType.NONE &&
            typeof response.uuid === "string" &&
            response.uuid.length > 0
          ) {
            const modelURL = wsControllerURL.replace(
              "/api",
              `/model/${response.uuid}/api`,
            );
            reduxStore.dispatch(
              disableCommand.run({
                modelUUID: response.uuid,
                modelURL,
                wsControllerURL,
                params: {
                  type: disabledCommands,
                },
              }),
            );
          }

          reduxStore.dispatch(
            jujuActions.setAddModelResult({
              success: true,
              wsControllerURL,
            }),
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Could not add model.";
        reduxStore.dispatch(
          jujuActions.setAddModelResult({
            errors: errorMessage,
            success: false,
            wsControllerURL,
          }),
        );
      } finally {
        reduxStore.dispatch(
          jujuActions.updateModelListLoading({
            wsControllerURL,
            loading: false,
          }),
        );
      }
      // The action has already been passed to the next middleware
      // at the top of this handler.
      return;
    }
    return next(action);
  };
}

export const modelPollerMiddleware: Middleware<
  void,
  RootState,
  Store["dispatch"]
> = (reduxStore) => {
  const { connections, middleware: uninitialisedConnectionsMiddleware } =
    createConnectionMiddleware();

  return (next) => (action) => {
    const connectionsMiddleware = uninitialisedConnectionsMiddleware(
      reduxStore,
    )(runModelPoller(reduxStore, connections, next));

    return connectionsMiddleware(action);
  };
};
