import { fetchAllModelStatuses, loginWithBakery } from "juju";
import { fetchModelList } from "juju/actions";
import {
  updateControllerConnection,
  updateJujuAPIInstance,
  updatePingerIntervalId
} from "app/actions";

export default async function connectAndListModels(reduxStore, bakery) {
  try {
    // eslint-disable-next-line no-console
    console.log("Logging into the Juju controller.");
    const { conn, juju, intervalId } = await loginWithBakery(bakery);
    reduxStore.dispatch(updateControllerConnection(conn));
    reduxStore.dispatch(updateJujuAPIInstance(juju));
    reduxStore.dispatch(updatePingerIntervalId(intervalId));
    // eslint-disable-next-line no-console
    console.log("Fetching model list.");
    await reduxStore.dispatch(fetchModelList());
    // eslint-disable-next-line no-console
    console.log("Fetching model statuses");

    let continuePolling = true;
    while (continuePolling) {
      await fetchAllModelStatuses(conn, reduxStore);
      // Wait 30s then start again.
      continuePolling = await new Promise(resolve => {
        setTimeout(() => {
          // XXX Add ability to toggle true to false to pause polling.
          resolve(true);
        }, 30000);
      });
      // Fetch the model list again as it may have changed.
      await reduxStore.dispatch(fetchModelList());
    }
  } catch (error) {
    // XXX Surface error to UI.
    // XXX Send to sentry.
    // eslint-disable-next-line no-console
    console.log("Something went wrong: ", error);
  }
}
