import type { Client } from "@canonical/jujulib";
import * as Sentry from "@sentry/react";
import { isAction, type Middleware } from "redux";

import { Auth } from "auth";
import {
  disableControllerUUIDMasking,
  fetchAllModelStatuses,
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
import { actions as generalActions } from "store/general";
import {
  getAnalyticsEnabled,
  getAppVersion,
  getIsJuju,
  isLoggedIn,
} from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
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

        let pollCount = 0;
        do {
          const identity = conn?.info?.user?.identity;
          if (identity) {
            try {
              const models = await conn.facades.modelManager?.listModels({
                tag: identity,
              });
              if (models) {
                reduxStore.dispatch(
                  jujuActions.updateModelList({ models, wsControllerURL }),
                );
              }
              const modelUUIDList =
                models?.["user-models"]?.map((item) => item.model.uuid) ?? [];
              await fetchAllModelStatuses(
                wsControllerURL,
                modelUUIDList,
                conn,
                reduxStore.dispatch,
                reduxStore.getState,
              );
              // If the code execution arrives here, then the model statuses
              // have been successfully updated. Models error should be removed.
              const { modelsError } = reduxStore.getState().juju;
              if (modelsError) {
                reduxStore.dispatch(
                  jujuActions.updateModelsError({
                    modelsError: null,
                    wsControllerURL,
                  }),
                );
              }
            } catch (listError) {
              let errorMessage: null | string = null;
              if (
                listError instanceof Error &&
                (listError.message === ModelsError.LOAD_ALL_MODELS ||
                  listError.message === ModelsError.LOAD_SOME_MODELS)
              ) {
                errorMessage = pollCount
                  ? ModelsError.LOAD_LATEST_MODELS
                  : listError.message;
              } else {
                errorMessage = ModelsError.LIST_OR_UPDATE_MODELS;
              }
              logger.error(errorMessage, listError);
              reduxStore.dispatch(
                jujuActions.updateModelsError({
                  modelsError: errorMessage,
                  wsControllerURL,
                }),
              );
            }
          }

          // Allow the polling to run a certain number of times in tests.
          if (import.meta.env.NODE_ENV === "test") {
            if (pollCount === action.payload.poll) {
              break;
            }
          }
          pollCount++;
          // Wait 30s then start again.
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(true);
            }, 30000);
          });
        } while (isLoggedIn(reduxStore.getState(), wsControllerURL));
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
    }
    return next(action);
  };
};
