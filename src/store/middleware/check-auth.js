/*
  Redux middleware that gates every request on authentication unless an action
  has been allowed.
*/

import { isLoggedIn } from "store/general/selectors";
import { actions as uiActions } from "store/ui";
import { actions as generalActions } from "store/general";
import { actions as appActions, thunks as appThunks } from "store/app";

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
  return isLoggedIn(state, wsControllerURL);
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
// eslint-disable-next-line import/no-anonymous-default-export
export default ({ getState }) =>
  (next) =>
  async (action) => {
    // These lists need to be generated at run time to prevent circular imports.
    const actionAllowlist = [
      "POPULATE_MISSING_ALLWATCHER_DATA",
      "PROCESS_ALL_WATCHER_DELTAS",
      "UPDATE_CONTROLLER_LIST",
      "UPDATE_JUJU_API_INSTANCE",
      "CLEAR_CONTROLLER_DATA",
      "CLEAR_MODEL_DATA",
      "TOGGLE_USER_MENU",
      "SIDENAV_COLLAPSED",
      appActions.connectAndPollControllers.type,
      generalActions.storeConfig.type,
      generalActions.storeLoginError.type,
      generalActions.storeUserPass.type,
      generalActions.storeVersion.type,
      generalActions.storeVisitURL.type,
      generalActions.updateControllerConnection.type,
      generalActions.updatePingerIntervalId.type,
      uiActions.userMenuActive.type,
      uiActions.sideNavCollapsed.type,
    ];

    const thunkAllowlist = [
      appThunks.connectAndListModels.fulfilled.type,
      appThunks.connectAndListModels.pending.type,
      appThunks.connectAndListModels.rejected.type,
      appThunks.connectAndStartPolling.fulfilled.type,
      appThunks.connectAndStartPolling.pending.type,
      appThunks.connectAndStartPolling.rejected.type,
      appThunks.logOut.fulfilled.type,
      appThunks.logOut.pending.type,
      appThunks.logOut.rejected.type,
    ];

    const state = getState();
    const wsControllerURL = action.payload?.wsControllerURL;

    // If the action is a function then it's probably a thunk.
    if (typeof action === "function") {
      // Authentication checks are done by the thunks.
      return await next(action);
    } else {
      if (
        actionAllowlist.includes(action.type) ||
        thunkAllowlist.includes(action.type) ||
        checkLoggedIn(state, wsControllerURL)
      ) {
        return next(action);
      } else {
        error(action.type, wsControllerURL);
      }
    }
  };
