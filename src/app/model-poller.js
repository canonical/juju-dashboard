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

export default async function connectAndListModels(reduxStore, bakery) {
  try {
    const storeState = reduxStore.getState();
    const credentials = getUserPass(storeState);
    const { identityProviderAvailable, isJuju } = getConfig(storeState);
    const wsControllerURL = getWSControllerURL(storeState);
    const { conn, error, juju, intervalId } = await loginWithBakery(
      wsControllerURL,
      credentials,
      bakery,
      identityProviderAvailable
    );
    if (error) {
      reduxStore.dispatch(storeLoginError(error));
      return;
    }
    if (process.env.NODE_ENV === "production") {
      Sentry.setTag("jujuVersion", conn?.info?.serverVersion);
    }
    reduxStore.dispatch(updateControllerConnection(conn));
    reduxStore.dispatch(updateJujuAPIInstance(juju));
    reduxStore.dispatch(updatePingerIntervalId(intervalId));
    if (userIsControllerAdmin(conn)) {
      fetchControllerList(conn, reduxStore);
      if (!isJuju) {
        // This call will be a noop if the user isn't an administrator
        // on the JIMM controller we're connected to.
        disableControllerUUIDMasking(conn);
      }
    }
    do {
      await reduxStore.dispatch(fetchModelList());
      await fetchAllModelStatuses(conn, reduxStore);
      // Wait 30s then start again.
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 30000);
      });
    } while (isLoggedIn(reduxStore.getState()));
  } catch (error) {
    // XXX Surface error to UI.
    // XXX Send to sentry if it's an error that's not connection related
    // a common error returned by this is:
    // Something went wrong:  cannot send request {"type":"ModelManager","request":"ListModels","version":5,"params":...}: connection state 3 is not open
    console.error("Something went wrong: ", error);
  }
}
