/*
  Redux middleware that gates every request on authentication unless an action
  has been allowed.
*/

import type { Middleware } from "redux";

import { actions as appActions, thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";
import { isLoggedIn } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { addControllerCloudRegion } from "store/juju/thunks";
import type { RootState, Store } from "store/store";
import { actions as uiActions } from "store/ui";

function error(name: string, wsControllerURL: string) {
  console.error(
    "Unable to perform action: ",
    name,
    wsControllerURL
      ? `. User not authenticated for the controller: ${wsControllerURL}. ` +
          "This shouldn't be able to happen!"
      : ". Either 'wsControllerURL' needs to be added to the dispatched " +
          "action or add the action to the list of actions allowed to be " +
          "performed while logged out."
  );
}

export const checkLoggedIn = (state: RootState, wsControllerURL: string) => {
  if (!wsControllerURL) {
    console.error(
      "Unable to determine logged in status. " +
        "'wsControllerURL' was not provided in the action that was dispatched."
    );
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
  void,
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
      generalActions.clearVisitURLs.type,
      generalActions.logOut.type,
      generalActions.removeVisitURL.type,
      generalActions.storeConfig.type,
      generalActions.storeLoginError.type,
      generalActions.storeConnectionError.type,
      generalActions.storeUserPass.type,
      generalActions.storeVersion.type,
      generalActions.storeVisitURL.type,
      generalActions.updateControllerConnection.type,
      generalActions.updatePingerIntervalId.type,
      jujuActions.populateMissingAllWatcherData.type,
      jujuActions.processAllWatcherDeltas.type,
      jujuActions.updateAuditEvents.type,
      jujuActions.updateAuditEventsLimit.type,
      jujuActions.updateControllerList.type,
      jujuActions.clearControllerData.type,
      jujuActions.clearModelData.type,
      jujuActions.clearAuditEvents.type,
      jujuActions.updateCrossModelQuery.type,
      jujuActions.updateControllerList.type,
      jujuActions.clearControllerData.type,
      jujuActions.clearModelData.type,
      jujuActions.clearCrossModelQuery.type,
      jujuActions.updateSelectedApplications.type,
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
      addControllerCloudRegion.fulfilled.type,
      addControllerCloudRegion.pending.type,
      addControllerCloudRegion.rejected.type,
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
