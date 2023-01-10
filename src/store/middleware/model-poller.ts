import { Middleware } from "redux";
import * as Sentry from "@sentry/browser";

import { actionsList } from "app/action-types";
import { isLoggedIn } from "store/general/selectors";
import { actions as generalActions } from "store/general";
import {
  disableControllerUUIDMasking,
  fetchAllModelStatuses,
  fetchControllerList,
  loginWithBakery,
} from "juju/api";
import { updateModelList } from "juju/actions";
import { TSFixMe } from "@canonical/react-components";
import { PayloadAction } from "@reduxjs/toolkit";
import { RootState, Store } from "store/store";

export enum LoginError {
  LOG = "unable to log into controller",
  NO_INFO = "Unable to retrieve controller details",
}

// TODO: provide these types when the types are available from jujulib.
// TODO: Import bakery instead of passing it as a param.
type ControllerOptions = [string, TSFixMe, boolean, boolean | undefined];

export const modelPollerMiddleware: Middleware<
  {},
  RootState,
  Store["dispatch"]
> = (reduxStore) => {
  // TODO: provide the connection when the types are available from jujulib.
  const jujus = new Map<string, TSFixMe>();
  return (next) =>
    async (
      action: PayloadAction<{
        controllers: ControllerOptions[];
        isJuju: boolean;
      }>
    ) => {
      if (action.type === actionsList.connectAndPollControllers) {
        action.payload.controllers.forEach(async (controllerData) => {
          const [
            wsControllerURL,
            credentials,
            identityProviderAvailable,
            isAdditionalController,
          ] = controllerData;
          let conn, error, juju, intervalId;
          try {
            ({ conn, error, juju, intervalId } = await loginWithBakery(
              wsControllerURL,
              credentials,
              identityProviderAvailable
            ));
            if (error) {
              // TODO: this error should not be cast once loginWithBakery has
              // been migrated to TypeScript.
              reduxStore.dispatch(
                generalActions.storeLoginError(error as string)
              );
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

          if (!conn?.info) {
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
          jujus.set(wsControllerURL, juju);
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
            try {
              const models = await conn.facades.modelManager.listModels({
                tag: conn.info.user.identity,
              });
              reduxStore.dispatch(updateModelList(models, wsControllerURL));
              // TODO: this error should not be cast once the types are
              // available from jujulib.
              const modelUUIDList = models["user-models"].map(
                (item: TSFixMe) => item.model.uuid
              );
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

            // Wait 30s then start again.
            await new Promise((resolve) => {
              setTimeout(() => {
                resolve(true);
              }, 30000);
            });
          } while (isLoggedIn(reduxStore.getState(), wsControllerURL));
        });
        return;
      } else if (action.type === actionsList.logOut) {
        jujus.forEach((juju) => {
          juju.logout();
        });
      }
      return next(action);
    };
};
