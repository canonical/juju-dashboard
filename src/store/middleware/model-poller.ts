import type { Client } from "@canonical/jujulib";
import * as Sentry from "@sentry/browser";
import type { AnyAction, Middleware } from "redux";

import {
  disableControllerUUIDMasking,
  fetchAllModelStatuses,
  fetchControllerList,
  findAuditEvents,
  crossModelQuery,
  loginWithBakery,
  setModelSharingPermissions,
} from "juju/api";
import type { CrossModelQueryFullResponse } from "juju/jimm/JIMMV4";
import { JIMMRelation } from "juju/jimm/JIMMV4";
import type { ConnectionWithFacades } from "juju/types";
import { actions as appActions, thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";
import { isLoggedIn } from "store/general/selectors";
import type { Credential } from "store/general/types";
import { actions as jujuActions } from "store/juju";
import type { RootState, Store } from "store/store";

export enum LoginError {
  LOG = "Unable to log into controller",
  NO_INFO = "Unable to retrieve controller details",
}

type ControllerOptions = [string, Credential, boolean, boolean | undefined];

const checkJIMMRelation = async (
  conn: ConnectionWithFacades,
  identity: string,
  relation: string
) => {
  const response = await conn.facades.jimM?.checkRelation({
    object: identity,
    relation: relation,
    target_object: "controller-jimm",
  });
  if (typeof response === "string") {
    throw new Error(response);
  }
  return !!response?.allowed;
};

export const modelPollerMiddleware: Middleware<
  void,
  RootState,
  Store["dispatch"]
> = (reduxStore) => {
  const controllers = new Map<string, ConnectionWithFacades>();
  const jujus = new Map<string, Client>();
  return (next) => async (action: AnyAction) => {
    if (action.type === appActions.connectAndPollControllers.type) {
      // Each time we try to log in to a controller we get new macaroons, so
      // first clean up any old auth requests:
      reduxStore.dispatch(generalActions.clearVisitURLs());
      action.payload.controllers.forEach(
        async (controllerData: ControllerOptions) => {
          const [
            wsControllerURL,
            credentials,
            identityProviderAvailable,
            isAdditionalController,
          ] = controllerData;
          let conn: ConnectionWithFacades | undefined;
          let juju: Client | undefined;
          let error: unknown;
          let intervalId: number | null | undefined;
          try {
            ({ conn, error, juju, intervalId } = await loginWithBakery(
              wsControllerURL,
              credentials,
              identityProviderAvailable
            ));
            if (conn) {
              controllers.set(wsControllerURL, conn);
            }
            if (error && typeof error === "string") {
              reduxStore.dispatch(
                generalActions.storeLoginError({ wsControllerURL, error })
              );
              return;
            }
          } catch (e) {
            reduxStore.dispatch(
              generalActions.storeLoginError({
                wsControllerURL,
                error:
                  "Unable to log into the controller, check that the controller address is correct and that it is online.",
              })
            );
            return console.log(LoginError.LOG, e, controllerData);
          }

          if (!conn?.info || !Object.keys(conn.info).length) {
            reduxStore.dispatch(
              generalActions.storeLoginError({
                wsControllerURL,
                error: LoginError.NO_INFO,
              })
            );
            return;
          }

          // XXX Now that we can register multiple controllers this needs
          // to be sent per controller.
          if (
            process.env.NODE_ENV === "production" &&
            window.jujuDashboardConfig?.analyticsEnabled
          ) {
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
            })
          );
          const jimmVersion = conn.facades.jimM?.version ?? 0;
          const auditLogsAvailable = jimmVersion >= 4;
          const identity = conn.info.user?.identity;
          let auditLogsAllowed = false;
          if (auditLogsAvailable && identity) {
            try {
              auditLogsAllowed = await checkJIMMRelation(
                conn,
                identity,
                JIMMRelation.AUDIT_LOG_VIEWER
              );
              if (!auditLogsAllowed) {
                auditLogsAllowed = await checkJIMMRelation(
                  conn,
                  identity,
                  JIMMRelation.ADMINISTRATOR
                );
              }
            } catch (error) {
              // TODO: this should be displayed to the user somehow.
              console.error("Unable to check user permissions", error);
            }
          }
          reduxStore.dispatch(
            generalActions.updateControllerFeatures({
              wsControllerURL,
              features: {
                crossModelQueries: jimmVersion >= 4,
                auditLogs: auditLogsAllowed && auditLogsAvailable,
              },
            })
          );
          if (juju) {
            jujus.set(wsControllerURL, juju);
          }
          if (intervalId) {
            reduxStore.dispatch(
              generalActions.updatePingerIntervalId({
                wsControllerURL,
                intervalId,
              })
            );
          }

          await fetchControllerList(
            wsControllerURL,
            conn,
            isAdditionalController ?? false,
            reduxStore.dispatch,
            reduxStore.getState
          );
          if (identityProviderAvailable) {
            // This call will be a noop if the user isn't an administrator
            // on the JIMM controller we're connected to.
            try {
              await disableControllerUUIDMasking(conn);
            } catch (e) {
              // Silently fail, if this doesn't work then the user isn't authorized
              // to perform the action.
            }
          }

          do {
            const identity = conn?.info?.user?.identity;
            if (identity) {
              try {
                const models = await conn.facades.modelManager?.listModels({
                  tag: identity,
                });
                if (models) {
                  reduxStore.dispatch(
                    jujuActions.updateModelList({ models, wsControllerURL })
                  );
                }
                const modelUUIDList =
                  models?.["user-models"]?.map((item) => item.model.uuid) ?? [];
                await fetchAllModelStatuses(
                  wsControllerURL,
                  modelUUIDList,
                  conn,
                  reduxStore.dispatch,
                  reduxStore.getState
                );
              } catch (e) {
                console.log(e);
              }
            }

            // Wait 30s then start again.
            await new Promise((resolve) => {
              setTimeout(() => {
                resolve(true);
              }, 30000);
            });
          } while (isLoggedIn(reduxStore.getState(), wsControllerURL));
        }
      );
      return;
    } else if (action.type === appThunks.logOut.pending.type) {
      jujus.forEach((juju) => {
        juju.logout();
      });
      return next(action);
    } else if (action.type === appActions.updatePermissions.type) {
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
        reduxStore.dispatch
      );
      return response;
    } else if (action.type === jujuActions.fetchAuditEvents.type) {
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
      const auditEvents = await findAuditEvents(conn, params);
      reduxStore.dispatch(jujuActions.updateAuditEvents(auditEvents.events));
      // The action has already been passed to the next middleware at the top of
      // this handler.
      return;
    } else if (action.type === jujuActions.fetchCrossModelQuery.type) {
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
      let crossModelQueryResponse: CrossModelQueryFullResponse;
      try {
        crossModelQueryResponse = await crossModelQuery(conn, query);
      } catch (error) {
        console.error("Could not perform cross model query:", error);
        crossModelQueryResponse =
          "Unable to perform search. Please try again later.";
      }
      reduxStore.dispatch(
        jujuActions.updateCrossModelQuery(crossModelQueryResponse)
      );
      // The action has already been passed to the next middleware
      // at the top of this handler.
      return;
    }
    return next(action);
  };
};
