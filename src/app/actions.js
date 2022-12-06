import { getPingerIntervalIds } from "app/selectors";
import bakery from "app/bakery";

import {
  clearControllerData,
  clearModelData,
  updateControllerList,
} from "juju/actions";

import {
  getConfig,
  getControllerConnections,
  getUserPass,
  getWSControllerURL,
} from "./selectors";
import { actionsList } from "./action-types";

// Action creators
/**
  @param {Object} config The configuration values for the application.
*/
export function storeConfig(config) {
  return {
    type: actionsList.storeConfig,
    payload: config,
  };
}

/**
  @param {String} error The error message to store.
*/
export function storeLoginError(error) {
  return {
    type: actionsList.storeLoginError,
    payload: error,
  };
}

/**
  @param {String} version The version of the application.
*/
export function storeVersion(version) {
  return {
    type: actionsList.storeVersion,
    payload: version,
  };
}

/**
  @param {Object} credentials The users credentials in the format
    {user: ..., password: ...}
*/
export function storeUserPass(wsControllerURL, credential) {
  return {
    type: actionsList.storeUserPass,
    payload: {
      wsControllerURL,
      credential,
    },
  };
}

/**
  @param {String} wsControllerURL The URL of the websocket connection.
  @param {Object} info The controller connection info.
*/
export function updateControllerConnection(wsControllerURL, info) {
  return {
    type: actionsList.updateControllerConnection,
    payload: {
      wsControllerURL,
      info,
    },
  };
}

/**
  @param {String} wsControllerURL The URL of the websocket connection.
  @param {Object} intervalId The intervalId for the request timeout.
*/
export function updatePingerIntervalId(wsControllerURL, intervalId) {
  return {
    type: actionsList.updatePingerIntervalId,
    payload: {
      wsControllerURL,
      intervalId,
    },
  };
}

/**
  @param {String} visitURL The url the user needs to connect to to complete the
    bakery login.
*/
export function storeVisitURL(visitURL) {
  return {
    type: actionsList.storeVisitURL,
    payload: visitURL,
  };
}

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
          dispatch(storeUserPass(controller[0], controller[1]));
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
    const credentials = getUserPass(wsControllerURL, storeState);
    const controllerConnections = getControllerConnections(storeState) || {};
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
