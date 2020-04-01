import {
  fetchAllModelStatuses,
  fetchControllerList,
  loginWithBakery,
} from "juju";
import { fetchModelList } from "juju/actions";
import {
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

export default async function connectAndListModels(reduxStore, bakery) {
  try {
    const storeState = reduxStore.getState();
    const credentials = getUserPass(storeState);
    const { identityProviderAvailable } = getConfig(storeState);
    const wsControllerURL = getWSControllerURL(storeState);
    const { conn, juju, intervalId } = await loginWithBakery(
      wsControllerURL,
      credentials,
      bakery,
      identityProviderAvailable
    );
    reduxStore.dispatch(updateControllerConnection(conn));
    reduxStore.dispatch(updateJujuAPIInstance(juju));
    reduxStore.dispatch(updatePingerIntervalId(intervalId));
    fetchControllerList(reduxStore);
    do {
      await reduxStore.dispatch(fetchModelList());
      await fetchAllModelStatuses(conn, reduxStore);
      // Wait 30s then start again.
      await new Promise(resolve => {
        setTimeout(() => {
          resolve(true);
        }, 30000);
      });
    } while (isLoggedIn(reduxStore.getState()));
  } catch (error) {
    // XXX Surface error to UI.
    // XXX Send to sentry.
    // eslint-disable-next-line no-console
    console.log("Something went wrong: ", error);
  }
}
