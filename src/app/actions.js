import bakery from "app/bakery";

import {
  clearControllerData,
  clearModelData,
  updateControllerList,
} from "juju/actions";
import { actions as generalActions } from "store/general";
import {
  getConfig,
  getControllerConnections,
  getPingerIntervalIds,
  getUserPass,
  getWSControllerURL,
} from "store/general/selectors";

import { actionsList } from "./action-types";

export const updatePermissions = (
  wsControllerURL,
  modelUUID,
  user,
  permissionTo,
  permissionFrom,
  action
) => ({
  type: actionsList.updatePermissions,
  payload: {
    action,
    modelUUID,
    permissionFrom,
    permissionTo,
    user,
    wsControllerURL,
  },
});

// Thunks
/**
  Flush bakery from redux store
*/
export function logOut(store) {
  async function logOut(dispatch) {
    const state = store.getState();
    const identityProviderAvailable =
      state?.general?.config?.identityProviderAvailable;
    const pingerIntervalIds = getPingerIntervalIds(state);
    bakery.storage._store.removeItem("identity");
    bakery.storage._store.removeItem("https://api.jujucharms.com/identity");
    localStorage.removeItem("additionalControllers");
    Object.entries(pingerIntervalIds).forEach((pingerIntervalId) =>
      clearInterval(pingerIntervalId[1])
    );
    dispatch({
      type: actionsList.logOut,
    });
    dispatch(clearModelData());
    dispatch(clearControllerData());
    if (identityProviderAvailable) {
      // To enable users to log back in after logging out we have to re-connect
      // to the controller to get another wait url and start polling on it
      // again.
      dispatch(connectAndStartPolling(store, bakery));
    }
  }
  // Define a name that won't be munged by the minifier to check
  // against in the check-auth middleware.
  logOut.NAME = "logOut";
  return logOut;
}

/**
  Trigger the connection and polling of models.
  @param {Object} reduxStore The reduxStore.
  @param {Object} bakery The bakery.
*/
export function connectAndStartPolling(reduxStore, bakery) {
  async function connectAndStartPolling(dispatch) {
    let additionalControllers = null;
    try {
      const data = window.localStorage.getItem("additionalControllers");
      if (data) {
        additionalControllers = JSON.parse(data);
        additionalControllers.forEach((controller) => {
          dispatch(
            generalActions.storeUserPass({
              wsControllerURL: controller[0],
              credential: controller[1],
            })
          );
          dispatch(
            updateControllerList(controller[0], [
              { additionalController: true },
            ])
          );
        });
      }
    } catch (e) {
      // XXX Add to Sentry.
      console.log("Error retrieving additional registered controllers", e);
    }
    connectAndListModels(reduxStore, bakery, additionalControllers);
  }
  // Define a name that won't be munged by the minifier to check
  // against in the check-auth middleware.
  connectAndStartPolling.NAME = "connectAndStartPolling";
  return connectAndStartPolling;
}

export async function connectAndListModels(
  reduxStore,
  bakery,
  additionalControllers
) {
  try {
    const storeState = reduxStore.getState();
    const { identityProviderAvailable, isJuju } = getConfig(storeState);
    const wsControllerURL = getWSControllerURL(storeState);
    const credentials = getUserPass(storeState, wsControllerURL);
    const controllerConnections = getControllerConnections(storeState) || {};
    const defaultControllerData = [
      wsControllerURL,
      credentials,
      identityProviderAvailable,
    ];
    let controllerList = [defaultControllerData];
    if (additionalControllers) {
      controllerList = controllerList.concat(additionalControllers);
    }
    const connectedControllers = Object.keys(controllerConnections);
    controllerList = controllerList.filter((controllerData) => {
      // remove controllers we're already connected to.
      return !connectedControllers.includes(controllerData[0]);
    });
    reduxStore.dispatch(connectAndPollControllers(controllerList, isJuju));
  } catch (error) {
    // XXX Surface error to UI.
    // XXX Send to sentry if it's an error that's not connection related
    // a common error returned by this is:
    // Something went wrong:  cannot send request {"type":"ModelManager","request":"ListModels","version":5,"params":...}: connection state 3 is not open
    console.error("Something went wrong: ", error);
  }
}

export const connectAndPollControllers = (controllers, isJuju) => {
  return {
    type: actionsList.connectAndPollControllers,
    payload: {
      controllers,
      isJuju,
    },
  };
};
