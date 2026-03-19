import type { Client } from "@canonical/jujulib";
import { unwrapResult } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/react";
import { isAction, type Middleware } from "redux";

import { Auth } from "auth";
import {
  disableControllerUUIDMasking,
  fetchAndStoreModelStatus,
  fetchControllerList,
  fetchModelInfo,
  loginWithBakery,
  setModelSharingPermissions,
} from "juju/api";
import {
  checkRelation,
  checkRelations,
  crossModelQuery,
  findAuditEvents,
} from "juju/jimm/api";
import type { ConnectionWithFacades, DestroyModelErrors } from "juju/types";
import { actions as appActions, thunks as appThunks } from "store/app";
import { beginPollingModelList, updateModelStatuses } from "store/app/actions";
import { actions as generalActions } from "store/general";
import {
  getAnalyticsEnabled,
  getAppVersion,
  getIsJuju,
  isLoggedIn,
} from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { getModelList } from "store/juju/selectors";
import { addControllerCloudRegion } from "store/juju/thunks";
import type { RootState, Store } from "store/store";
import { isSpecificAction } from "types";
import { toErrorString } from "utils";
import analytics from "utils/analytics";
import { logger } from "utils/logger";

export enum LoginError {
  LOG = "Unable to log into controller.",
  NO_INFO = "Unable to retrieve controller details.",
  WHOAMI = "Unable to check authentication status. You can attempt to log in anyway.",
}

export enum ModelsError {
  LOAD_ALL_MODELS = "Unable to load models.",
  LOAD_SOME_MODELS = "Unable to load some models.",
  LOAD_LATEST_MODELS = "Unable to load latest model data.",
  LIST_OR_UPDATE_MODELS = "Unable to list or update models.",
}

export const modelPollerMiddleware: Middleware<
  void,
  RootState,
  Store["dispatch"]
> = (reduxStore) => {
  const controllers = new Map<string, ConnectionWithFacades>();
  const jujus = new Map<string, Client>();
  return (next) => async (action) => {
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
      for (const controllerData of action.payload.controllers) {
        const [wsControllerURL, credentials] = controllerData;
        let conn: ConnectionWithFacades | null | undefined = null;
        let juju: Client | null | undefined = null;
        let error: unknown = null;
        let intervalId: null | number = null;
        reduxStore.dispatch(generalActions.updateLoginLoading(true));
        const continueConnection = await Auth.instance.beforeControllerConnect({
          wsControllerURL,
          credentials,
        });
        if (!continueConnection) {
          reduxStore.dispatch(generalActions.updateLoginLoading(false));
          return;
        }
        try {
          ({
            conn,
            error,
            juju,
            intervalId = null,
          } = await loginWithBakery(wsControllerURL, credentials));
          if (conn) {
            controllers.set(wsControllerURL, conn);
          }
          if (error) {
            reduxStore.dispatch(
              generalActions.storeLoginError({
                wsControllerURL,
                error: toErrorString(error),
              }),
            );
            return;
          }
        } catch (err) {
          reduxStore.dispatch(
            generalActions.storeLoginError({
              wsControllerURL,
              error:
                "Unable to log into the controller, check that the controller address is correct and that it is online.",
            }),
          );
          logger.log(LoginError.LOG, err, controllerData);
          return;
        } finally {
          reduxStore.dispatch(generalActions.updateLoginLoading(false));
        }

        if (!conn?.info || !Object.keys(conn.info).length) {
          reduxStore.dispatch(
            generalActions.storeLoginError({
              wsControllerURL,
              error: LoginError.NO_INFO,
            }),
          );
          return;
        }

        const analyticsEnabled = getAnalyticsEnabled(reduxStore.getState());
        const isJuju = !!getIsJuju(reduxStore.getState());
        const dashboardVersion = getAppVersion(reduxStore.getState()) ?? "";
        const controllerVersion = conn.info.serverVersion ?? "";

        analytics(
          !!analyticsEnabled,
          { dashboardVersion, controllerVersion, isJuju: isJuju.toString() },
          {
            category: "Authentication",
            action: `User Login (${Auth.instance.name})`,
          },
        );

        // XXX Now that we can register multiple controllers this needs
        // to be sent per controller.
        if (analyticsEnabled) {
          Sentry.setTag("jujuVersion", conn.info.serverVersion);
        }

        // Remove the getFacade function as this doesn't need to be stored in Redux.
        delete conn.info.getFacade;
        // Store the controller info. The transport and facades are not used
        // (or available by other means) so no need to store them.
        reduxStore.dispatch(
          generalActions.updateControllerConnection({
            wsControllerURL,
            info: conn.info,
          }),
        );
        const jimmVersion = conn.facades.jimM?.version ?? 0;
        reduxStore.dispatch(
          generalActions.updateControllerFeatures({
            wsControllerURL,
            features: {
              auditLogs: jimmVersion >= 4,
              crossModelQueries: jimmVersion >= 4,
              rebac: jimmVersion >= 4,
            },
          }),
        );
        if (juju) {
          jujus.set(wsControllerURL, juju);
        }
        if (intervalId) {
          reduxStore.dispatch(
            generalActions.updatePingerIntervalId({
              wsControllerURL,
              intervalId,
            }),
          );
        }

        reduxStore.dispatch(jujuActions.fetchClouds({ wsControllerURL }));
        await fetchControllerList(
          wsControllerURL,
          conn,
          reduxStore.dispatch,
          reduxStore.getState,
        );
        if (!isJuju) {
          // This call will be a noop if the user isn't an administrator
          // on the JIMM controller we're connected to.
          try {
            await disableControllerUUIDMasking(conn);
          } catch (err) {
            // Silently fail, if this doesn't work then the user isn't authorized
            // to perform the action.
          }
        }
      }

      reduxStore.dispatch(beginPollingModelList({ poll: action.payload.poll }));
      return;
    } else if (
      isSpecificAction<ReturnType<typeof beginPollingModelList>>(
        action,
        beginPollingModelList.type,
      )
    ) {
      let successes = 0;
      let count = 0;
      do {
        for (const [wsControllerURL, conn] of controllers.entries()) {
          if (!conn.info.user?.identity) {
            continue;
          }

          try {
            // Fetch the models from the current connection.
            const models = await conn.facades.modelManager?.listModels({
              tag: conn.info.user.identity,
            });
            if (!models) {
              continue;
            }

            // Save the model list into redux.
            reduxStore.dispatch(
              jujuActions.updateModelList({ models, wsControllerURL }),
            );
          } catch (listError) {
            const errorMessage = ModelsError.LIST_OR_UPDATE_MODELS;
            logger.error(errorMessage, listError);
            reduxStore.dispatch(
              jujuActions.updateModelsError({
                modelsError: errorMessage,
                wsControllerURL,
              }),
            );
            continue;
          }

          successes += 1;
        }
        // Model list updated, trigger loading of model status.
        reduxStore.dispatch(updateModelStatuses({ pollIteration: count }));
        // Wait 30s before polling again.
        await new Promise((resolve) => setTimeout(resolve, 30000));
        count += 1;
      } while (successes > 0 && count < (action.payload.poll ?? Infinity));
      return;
    } else if (
      isSpecificAction<ReturnType<typeof updateModelStatuses>>(
        action,
        updateModelStatuses.type,
      )
    ) {
      const modelList = Object.entries(getModelList(reduxStore.getState()));
      let errorCount = 0;
      let lastErrorWSController = null;
      for (const [modelUUID, { wsControllerURL }] of modelList) {
        const conn = controllers.get(wsControllerURL);
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
        let modelsError =
          errorCount === modelList.length
            ? ModelsError.LOAD_ALL_MODELS
            : ModelsError.LOAD_SOME_MODELS;

        if (action.payload.pollIteration > 0) {
          modelsError = ModelsError.LOAD_LATEST_MODELS;
        }

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
      jujus.forEach((juju) => {
        juju.logout();
      });
      return next(action);
    } else if (
      isSpecificAction<ReturnType<typeof appActions.updatePermissions>>(
        action,
        appActions.updatePermissions.type,
      )
    ) {
      const { payload } = action;
      const conn = controllers.get(payload.wsControllerURL);
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
      const conn = controllers.get(wsControllerURL);
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
      const conn = controllers.get(wsControllerURL);
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
      const conn = controllers.get(wsControllerURL);
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
      const conn = controllers.get(wsControllerURL);
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
      const conn = controllers.get(wsControllerURL);
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
      isSpecificAction<ReturnType<typeof jujuActions.fetchClouds>>(
        action,
        jujuActions.fetchClouds.type,
      )
    ) {
      // Intercept fetchClouds actions and fetch and store
      // the cloud information via the controller connection.
      const { wsControllerURL } = action.payload;
      // Immediately pass the action along so that it can be handled by the
      // reducer to update the loading state.
      next(action);
      const conn = controllers.get(wsControllerURL);
      if (!conn) {
        return;
      }
      try {
        const response = await conn.facades.cloud?.clouds({});
        if (response) {
          reduxStore.dispatch(
            "error" in response
              ? jujuActions.setCloudInfoErrors({
                  wsControllerURL,
                  errors: response.error,
                })
              : jujuActions.updateCloudInfo({
                  cloudInfo: response.clouds ?? undefined,
                  wsControllerURL,
                }),
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Could not fetch cloud information.";
        reduxStore.dispatch(
          jujuActions.setCloudInfoErrors({
            wsControllerURL,
            errors: errorMessage,
          }),
        );
      }
      // The action has already been passed to the next middleware
      // at the top of this handler.
      return;
    }
    return next(action);
  };
};
