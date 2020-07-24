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
  getControllerData,
  getUserPass,
  getWSControllerURL,
  isLoggedIn,
} from "./selectors";

export default async function connectAndListModels(
  reduxStore,
  bakery,
  additionalControllers
) {
  try {
    const storeState = reduxStore.getState();
    const { identityProviderAvailable, isJuju } = getConfig(storeState);
    const wsControllerURL = getWSControllerURL(storeState);
    const credentials = getUserPass(wsControllerURL, storeState);
    const controllers = getControllerData(storeState) || {};
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
    const connectedControllers = Object.keys(controllers);
    controllerList = controllerList.filter((controllerData) => {
      // remove controllers we're already connected to.
      return !connectedControllers.includes(controllerData[0]);
    });
    controllerList.forEach((controllerData) =>
      connectAndPollController(controllerData, isJuju, reduxStore)
    );
  } catch (error) {
    // XXX Surface error to UI.
    // XXX Send to sentry if it's an error that's not connection related
    // a common error returned by this is:
    // Something went wrong:  cannot send request {"type":"ModelManager","request":"ListModels","version":5,"params":...}: connection state 3 is not open
    console.error("Something went wrong: ", error);
  }
}

/**

  @param {Object} controllerData The data to use to connect to the controller.
    In the format [
      wsControllerURL - The fully qualified controller url wss://ip:port/api
      credentials - An object with the keys {user, password}
      bakery - An instance of the bakery to use if necessary
      identityProviderAvailable - If an identity provider is to be used. If so
        a bakery must be provided.
    ]
  @param {Boolean} isJuju
  @param {Object} reduxStore
*/
export async function connectAndPollController(
  controllerData,
  isJuju,
  reduxStore
) {
  let conn, error, juju, intervalId;
  try {
    ({ conn, error, juju, intervalId } = await loginWithBakery(
      ...controllerData
    ));
    if (error) {
      reduxStore.dispatch(storeLoginError(error));
      return;
    }
  } catch (e) {
    return console.log("unable to log into controller", e, controllerData);
  }

  // XXX Now that we can register multiple controllers this needs
  // to be sent per controller.
  if (process.env.NODE_ENV === "production") {
    Sentry.setTag("jujuVersion", conn?.info?.serverVersion);
  }

  reduxStore.dispatch(updateControllerConnection(controllerData[0], conn));
  reduxStore.dispatch(updateJujuAPIInstance(controllerData[0], juju));
  reduxStore.dispatch(updatePingerIntervalId(controllerData[0], intervalId));

  fetchControllerList(controllerData[0], conn, controllerData[4], reduxStore);
  // XXX the isJuju Check needs to be done on a per-controller basis
  if (!isJuju) {
    // This call will be a noop if the user isn't an administrator
    // on the JIMM controller we're connected to.
    disableControllerUUIDMasking(conn);
  }

  do {
    await reduxStore.dispatch(fetchModelList(conn), {
      wsControllerURL: controllerData[0],
    });
    await fetchAllModelStatuses(controllerData[0], conn, reduxStore);
    // Wait 30s then start again.
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 30000);
    });
  } while (isLoggedIn(controllerData[0], reduxStore.getState()));
}
