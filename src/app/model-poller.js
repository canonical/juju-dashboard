import { fetchAllModelStatuses, loginWithBakery } from "juju";
import { fetchModelList } from "juju/actions";
import {
  updateControllerConnection,
  updateJujuAPIInstance,
  updatePingerIntervalId
} from "app/actions";
import { isLoggedIn } from "./selectors";

export default async function connectAndListModels(reduxStore, bakery) {
  try {
    // eslint-disable-next-line no-console
    console.log("Logging into the Juju controller.");
    const { conn, juju, intervalId } = await loginWithBakery(bakery);
    reduxStore.dispatch(updateControllerConnection(conn));
    reduxStore.dispatch(updateJujuAPIInstance(juju));
    reduxStore.dispatch(updatePingerIntervalId(intervalId));
    do {
      // eslint-disable-next-line no-console
      console.log("Fetching model list.");
      await reduxStore.dispatch(fetchModelList());
      // eslint-disable-next-line no-console
      console.log("Fetching model statuses");
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
