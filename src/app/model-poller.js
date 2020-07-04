import * as Sentry from "@sentry/browser";
import {
  disableControllerUUIDMasking,
  fetchAllModelStatuses,
  fetchControllerList,
  loginWithBakery,
} from "juju";
import { fetchModelList } from "juju/actions";
import {
  storeLoginError,
  updateControllerConnection,
  updateJujuAPIInstance,
  updatePingerIntervalId,
} from "app/actions";
import {
  getConfig,
  getUserPass,
  getWSControllerURL,
  isLoggedIn,
} from "./selectors";

import { userIsControllerAdmin } from "./utils";

export default async function connectAndListModels(
  reduxStore,
  bakery,
  additionalControllers
) {
  try {
    const storeState = reduxStore.getState();
    const credentials = getUserPass(storeState);
    const { identityProviderAvailable, isJuju } = getConfig(storeState);
    const wsControllerURL = getWSControllerURL(storeState);
    const defaultControllerData = [
      wsControllerURL,
      credentials,
      bakery,
      identityProviderAvailable,
    ];
    let controllerList = [defaultControllerData];
    if (additionalControllers) {
      controllerList = controllerList.concat(additionalControllers);
    }
    controllerList.forEach(async (controllerData) => {
      const { conn, error, juju, intervalId } = await loginWithBakery(
        ...controllerData
      );

      if (error) {
        reduxStore.dispatch(storeLoginError(error));
        return;
      }

      if (process.env.NODE_ENV === "production") {
        Sentry.setTag("jujuVersion", conn?.info?.serverVersion);
      }

      reduxStore.dispatch(updateControllerConnection(controllerData[0], conn));
      reduxStore.dispatch(updateJujuAPIInstance(controllerData[0], juju));
      reduxStore.dispatch(
        updatePingerIntervalId(controllerData[0], intervalId)
      );
      if (true) {
        //if (userIsControllerAdmin(conn)) { // XXX re-enable me for prod.
        fetchControllerList(controllerData[0], conn, reduxStore);
        // XXX the isJuju Check needs to be done on a per-controller basis
        if (!isJuju) {
          // This call will be a noop if the user isn't an administrator
          // on the JIMM controller we're connected to.
          // disableControllerUUIDMasking(conn);
        }
      }
      do {
        await reduxStore.dispatch(fetchModelList(conn));
        await fetchAllModelStatuses(controllerData[0], conn, reduxStore);
        // Wait 30s then start again.
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 30000);
        });
      } while (isLoggedIn(controllerData[0], reduxStore.getState()));
    });
  } catch (error) {
    // XXX Surface error to UI.
    // XXX Send to sentry if it's an error that's not connection related
    // a common error returned by this is:
    // Something went wrong:  cannot send request {"type":"ModelManager","request":"ListModels","version":5,"params":...}: connection state 3 is not open
    console.error("Something went wrong: ", error);
  }
}
