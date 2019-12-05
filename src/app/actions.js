import {
  getBakery,
  getJujuAPIInstance,
  getPingerIntervalId
} from "app/selectors";

import { clearModelData } from "juju/actions";

// Action labels
export const actionsList = {
  collapsibleSidebar: "TOGGLE_COLLAPSIBLE_SIDEBAR",
  logOut: "LOG_OUT",
  storeBakery: "STORE_BAKERY",
  storeVisitURL: "STORE_VISIT_URL",
  updateControllerConnection: "UPDATE_CONTROLLER_CONNECTION",
  updateJujuAPIInstance: "UPDATE_JUJU_API_INSTANCE",
  updatePingerIntervalId: "UPDATE_PINGER_INTERVAL_ID"
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
    payload: bakery
  };
}

/**
  @param {Object} conn The active controller connection.
*/
export function updateControllerConnection(conn) {
  return {
    type: actionsList.updateControllerConnection,
    payload: conn
  };
}

export function updateJujuAPIInstance(juju) {
  return {
    type: actionsList.updateJujuAPIInstance,
    payload: juju
  };
}

export function updatePingerIntervalId(intervalId) {
  return {
    type: actionsList.updatePingerIntervalId,
    payload: intervalId
  };
}

/**
  @param {String} visitURL The url the user needs to connect to to complete the
    bakery login.
*/
export function storeVisitURL(visitURL) {
  return {
    type: actionsList.storeVisitURL,
    payload: visitURL
  };
}

export function clearBakeryIdentity() {
  return {
    type: actionsList.logOut
  };
}

// Thunks
/**
  Flush bakery from redux store
*/
export function logOut(getState) {
  return async function logOut(dispatch) {
    const state = getState();
    const bakery = getBakery(state);
    const juju = getJujuAPIInstance(state);
    const pingerIntervalId = getPingerIntervalId(state);
    bakery.storage._store.removeItem("identity");
    bakery.storage._store.removeItem("https://api.jujucharms.com/identity");
    juju.logout();
    clearInterval(pingerIntervalId);
    dispatch(clearBakeryIdentity());
    dispatch(clearModelData());
  };
}

/**
  Toggle collapsible sidebar
*/
export function collapsibleSidebar(toggle) {
  return {
    type: actionsList.collapsibleSidebar,
    payload: toggle
  };
}
