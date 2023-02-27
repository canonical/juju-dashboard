/*
  Redux middleware that gates every request on authentication unless an action
  has been allowed.
*/

import { isLoggedIn } from "store/general/selectors";
import { actions as uiActions } from "store/ui";
import { actions as generalActions } from "store/general";
import { actions as appActions, thunks as appThunks } from "store/app";
import { actions as jujuActions } from "store/juju";
import { Middleware } from "redux";
import { RootState, Store } from "store/store";

function error(name: string, wsControllerURL: string) {
  console.log(
    "unable to perform action:",
    name,
    "user not authenticated for:",
    wsControllerURL
  );
}

export const checkLoggedIn = (state: RootState, wsControllerURL: string) => {
  if (!wsControllerURL) {
    console.error("unable to determine logged in status");
  }
  return isLoggedIn(state, wsControllerURL);
};

/**
  Redux middleware to enable gating actions on the respective controller
  authentication.
  @param action The typical Redux action or thunk to execute
  @param options Any options that this checker needs to perform an
    appropriate auth check.
      wsControllerURL: The full controller websocket url that the controller
        is stored under in redux in order to determine it's logged in status.
*/
// eslint-disable-next-line import/no-anonymous-default-export
export const checkAuthMiddleware: Middleware<
  {},
  RootState,
  Store["dispatch"]
> =
  ({ getState }) =>
  (next) =>
  async (action) => {
    // These lists need to be generated at run time to prevent circular imports.
    const actionAllowlist = [
      appActions.connectAndPollControllers.type,
      generalActions.cleanupLoginErrors.type,
      generalActions.logOut.type,
      generalActions.storeConfig.type,
      generalActions.storeLoginError.type,
      generalActions.storeUserPass.type,
      generalActions.storeVersion.type,
      generalActions.storeVisitURL.type,
      generalActions.updateControllerConnection.type,
      generalActions.updatePingerIntervalId.type,
      jujuActions.populateMissingAllWatcherData.type,
      jujuActions.processAllWatcherDeltas.type,
      jujuActions.updateControllerList.type,
      jujuActions.clearControllerData.type,
      jujuActions.clearModelData.type,
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

export default checkAuthMiddleware;
