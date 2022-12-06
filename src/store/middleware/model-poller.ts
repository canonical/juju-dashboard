import { Middleware } from "redux";
import * as Sentry from "@sentry/browser";

import {
  storeLoginError,
  updateControllerConnection,
  updatePingerIntervalId,
} from "app/actions";
import { actionsList } from "app/action-types";
import { isLoggedIn } from "app/selectors";
import {
  disableControllerUUIDMasking,
  fetchAllModelStatuses,
  fetchControllerList,
  loginWithBakery,
} from "juju";
import { updateModelList } from "juju/actions";
import { TSFixMe } from "@canonical/react-components";
import { PayloadAction } from "@reduxjs/toolkit";

export enum LoginError {
  LOG = "unable to log into controller",
  NO_INFO = "Unable to retrieve controller details",
}

// TODO: provide these types when the types are available from jujulib.
// TODO: Import bakery instead of passing it as a param.
type ControllerOptions = [
  string,
  TSFixMe,
  TSFixMe,
  boolean,
  boolean | undefined
];

export const modelPollerMiddleware: Middleware = (reduxStore) => {
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
            bakery,
            identityProviderAvailable,
            isAdditionalController,
          ] = controllerData;
          let conn, error, juju, intervalId;
          try {
            ({ conn, error, juju, intervalId } = await loginWithBakery(
              wsControllerURL,
              credentials,
              bakery,
              identityProviderAvailable
            ));
            if (error) {
              // TODO: this error should not be cast once loginWithBakery has
              // been migrated to TypeScript.
              reduxStore.dispatch(storeLoginError(error as string));
              return;
            }
          } catch (e) {
            reduxStore.dispatch(
              storeLoginError(
                "Unable to log into the controller, check that you've configured the controller address correctly and that it is online."
              )
            );
            return console.log(LoginError.LOG, e, controllerData);
          }

          if (!conn?.info) {
            reduxStore.dispatch(storeLoginError(LoginError.NO_INFO));
            return;
          }

          // XXX Now that we can register multiple controllers this needs
          // to be sent per controller.
          if (process.env.NODE_ENV === "production") {
            Sentry.setTag("jujuVersion", conn.info.serverVersion);
          }

          // Store the controller info. The transport and facades are not used
          // (or available by other means) so no need to store them.
          reduxStore.dispatch(
            updateControllerConnection(wsControllerURL, conn.info)
          );
          jujus.set(wsControllerURL, juju);
          if (intervalId) {
            reduxStore.dispatch(
              updatePingerIntervalId(wsControllerURL, intervalId)
            );
          }

          fetchControllerList(
            wsControllerURL,
            conn,
            isAdditionalController ?? false,
            reduxStore
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
                reduxStore
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
          } while (isLoggedIn(wsControllerURL, reduxStore.getState()));
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
