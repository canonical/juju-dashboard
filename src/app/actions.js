import {
  getBakery,
  getJujuAPIInstances,
  getPingerIntervalIds,
} from "app/selectors";

import connectAndListModels from "app/model-poller";

import {
  clearControllerData,
  clearModelData,
  updateControllerList,
} from "juju/actions";

// Action labels
export const actionsList = {
  logOut: "LOG_OUT",
  storeBakery: "STORE_BAKERY",
  storeConfig: "STORE_CONFIG",
  storeLoginError: "STORE_LOGIN_ERROR",
  storeUserPass: "STORE_USER_PASS",
  storeVersion: "STORE_VERSION",
  storeVisitURL: "STORE_VISIT_URL",
  updateControllerConnection: "UPDATE_CONTROLLER_CONNECTION",
  updateJujuAPIInstance: "UPDATE_JUJU_API_INSTANCE",
  updatePingerIntervalId: "UPDATE_PINGER_INTERVAL_ID",
};

// Action creators
/**
  @param {Bakery} bakery The instance of the bakery that's to be used for the
  application to interact as the active user. This bakery contains private data
  and should not be dumped wholesale from the redux store.
*/
export function storeBakery(bakery) {
  return {
    type: actionsList.storeBakery,
    payload: bakery,
  };
}

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
  @param {Object} conn The active controller connection.
*/
export function updateControllerConnection(wsControllerURL, conn) {
  return {
    type: actionsList.updateControllerConnection,
    payload: {
      wsControllerURL,
      conn,
    },
  };
}

/**
  @param {String} wsControllerURL The URL of the websocket connection.
  @param {Object} juju The active Juju api instance.
*/
export function updateJujuAPIInstance(wsControllerURL, juju) {
  return {
    type: actionsList.updateJujuAPIInstance,
    payload: {
      wsControllerURL,
      juju,
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
      state?.root?.config?.identityProviderAvailable;
    const bakery = getBakery(state);
    const jujus = getJujuAPIInstances(state);
    const pingerIntervalIds = getPingerIntervalIds(state);
    bakery.storage._store.removeItem("identity");
    bakery.storage._store.removeItem("https://api.jujucharms.com/identity");
    localStorage.removeItem("additionalControllers");
    Object.entries(jujus).forEach((juju) => juju[1].logout());
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
