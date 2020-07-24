/*
  Redux middleware that gates every request on authentication unless an action
  has been whitelisted.
*/

import { isLoggedIn } from "app/selectors";

const actionWhitelist = [
  "STORE_BAKERY",
  "STORE_LOGIN_ERROR",
  "STORE_CONFIG",
  "STORE_USER_PASS",
  "STORE_VERSION",
  "UPDATE_CONTROLLER_CONNECTION",
  "UPDATE_JUJU_API_INSTANCE",
  "UPDATE_PINGER_INTERVAL_ID",
  "LOG_OUT",
  "CLEAR_MODEL_DATA",
  "STORE_VISIT_URL",
  "TOGGLE_COLLAPSIBLE_SIDEBAR",
  "TOGGLE_USER_MENU",
];

// When updating this list be sure to update the mangle.reserved list in
// craco.config.js so that the name doesn't get mangled by CRA.
const thunkWhitelist = ["connectAndStartPolling", "logOut"];

function error(name, wsControllerURL) {
  console.log(
    "unable to perform action:",
    name,
    "user not authenticated for:",
    wsControllerURL
  );
}

const checkLoggedIn = (state, wsControllerURL) => {
  if (!wsControllerURL) {
    console.error("unable to determine logged in status");
  }
  return isLoggedIn(wsControllerURL, state);
};

/**
  Redux middleware to enable gating actions on the respective controller
  authentication.
  @param {Object} action The typical Redux action or thunk to execute
  @param {Object} options Any options that this checker needs to perform an
    appropriate auth check.
      wsControllerURL: The full controller websocket url that the controller
        is stored under in redux in order to determine it's logged in status.
*/
export default ({ getState }) => (next) => async (action, options) => {
  const state = getState();
  const wsControllerURL = options?.wsControllerURL;

  // If the action is a function then it's probably a thunk.
  if (typeof action === "function") {
    if (
      thunkWhitelist.includes(action.name) ||
      checkLoggedIn(state, wsControllerURL)
    ) {
      // Await the next to support async thunks
      await next(action);
      return;
    } else {
      error(action.name, wsControllerURL);
    }
  } else {
    if (
      actionWhitelist.includes(action.type) ||
      checkLoggedIn(state, wsControllerURL)
    ) {
      next(action);
      return;
    } else {
      error(action.type, wsControllerURL);
    }
  }
};
