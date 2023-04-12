import type { Client } from "@canonical/jujulib";
import type { TSFixMe } from "@canonical/react-components";
import * as Sentry from "@sentry/browser";
import type { Middleware } from "redux";

import {
  disableControllerUUIDMasking,
  fetchAllModelStatuses,
  fetchControllerList,
  loginWithBakery,
  setModelSharingPermissions,
} from "juju/api";
import type { ConnectionWithFacades } from "juju/types";
import { actions as appActions, thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";
import { isLoggedIn } from "store/general/selectors";
import type { Credential } from "store/general/types";
import { actions as jujuActions } from "store/juju";
import type { RootState, Store } from "store/store";

export enum LoginError {
  LOG = "unable to log into controller",
  NO_INFO = "Unable to retrieve controller details",
}

type ControllerOptions = [string, Credential, boolean, boolean | undefined];

export const modelPollerMiddleware: Middleware<
  void,
  RootState,
  Store["dispatch"]
> = (reduxStore) => {
  const controllers = new Map<string, ConnectionWithFacades>();
  const jujus = new Map<string, Client>();
  return (next) => async (action) => {
    if (action.type === appActions.connectAndPollControllers.type) {
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
              reduxStore.dispatch(generalActions.storeLoginError(error));
              return;
            }
          } catch (e) {
            reduxStore.dispatch(
              generalActions.storeLoginError(
                "Unable to log into the controller, check that you've configured the controller address correctly and that it is online."
              )
            );
            return console.log(LoginError.LOG, e, controllerData);
          }

          if (!conn?.info || !Object.keys(conn.info).length) {
            reduxStore.dispatch(
              generalActions.storeLoginError(LoginError.NO_INFO)
            );
            return;
          }

          // XXX Now that we can register multiple controllers this needs
          // to be sent per controller.
          if (process.env.NODE_ENV === "production") {
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

          fetchControllerList(
            wsControllerURL,
            conn,
            isAdditionalController ?? false,
            reduxStore.dispatch,
            reduxStore.getState
          );
          // XXX the isJuju Check needs to be done on a per-controller basis
          if (!action.payload.isJuju) {
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
            // TSFixMe: jujulib types user as `object`.
            const identity = (conn?.info?.user as TSFixMe)?.identity;
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
    }
    return next(action);
  };
};
