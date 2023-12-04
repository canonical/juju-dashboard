import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "store/store";

import type { ControllerFeatures } from "./types";

const slice = (state: RootState) => state.general;

/**
  Fetches the application config from state.
  @param state The application state.
  @returns The config object or null if none found.
*/
export const getConfig = createSelector(
  [slice],
  (sliceState) => sliceState?.config
);

/**
  Determines if Juju is used based on config value from state.
  @param state The application state.
  @returns true if Juju is used, false if Juju isn't used or
    undefined if config is undefined.
 */
export const getIsJuju = createSelector(
  [slice],
  (sliceState) => sliceState?.config?.isJuju
);

/**
  Determines if analytics is enabled based on config value from state.
  @param state The application state.
  @returns true if analytics is enabled, false if analytics isn't enabled,
    or undefined if config is undefined.
 */
export const getAnalyticsEnabled = createSelector(
  [slice],
  (sliceState) => sliceState?.config?.analyticsEnabled
);

export const getVisitURLs = createSelector(
  [slice],
  (sliceState) => sliceState?.visitURLs
);

/**
  Fetches the username and password from state.
  @param state The application state.
  @param wsControllerURL The fully qualified wsController URL to
    retrieve the credentials from.
  @returns The username and password or null if none found.
*/
export const getUserPass = createSelector(
  [slice, (_state, wsControllerURL) => wsControllerURL],
  (sliceState, wsControllerURL) => sliceState?.credentials?.[wsControllerURL]
);

export const getConnectionError = createSelector(
  [slice],
  (sliceState) => sliceState?.connectionError
);

/**
  Fetches login errors from state
  @param state The application state.
  @returns The collection of error messages if any.
*/
export const getLoginErrors = createSelector(
  [slice],
  (sliceState) => sliceState?.loginErrors
);

/**
  Fetches a login error from state
  @param state The application state.
  @param wsControllerURL The wsController URL to retrieve errors for.
  @returns The error message if any.
*/
export const getLoginError = createSelector(
  [getLoginErrors, (_state, wsControllerURL) => wsControllerURL],
  (loginErrors, wsControllerURL) => loginErrors?.[wsControllerURL]
);

/**
  Fetches the pinger intervalId from state.
  @param state The application state.
  @returns The pinger intervalId or null if none found.
*/
export const getPingerIntervalIds = createSelector(
  [slice],
  (sliceState) => sliceState?.pingerIntervalIds
);

/**
  Fetches the application version.
  @param state The application state.
  @returns The application version or undefined
*/
export const getAppVersion = createSelector(
  [slice],
  (sliceState) => sliceState?.appVersion
);

export const getControllerConnections = createSelector(
  [slice],
  (sliceState) => sliceState?.controllerConnections
);

export const getControllerConnection = createSelector(
  [getControllerConnections, (_state, wsControllerURL) => wsControllerURL],
  (controllerConnections, wsControllerURL) =>
    controllerConnections?.[wsControllerURL]
);

export const getControllerFeatures = createSelector(
  [slice],
  (sliceState) => sliceState?.controllerFeatures
);

export const getControllerFeatureEnabled = createSelector(
  [
    getControllerFeatures,
    (_state, wsControllerURL, feature: keyof ControllerFeatures) => ({
      wsControllerURL,
      feature,
    }),
  ],
  (controllerFeatures, { wsControllerURL, feature }) =>
    controllerFeatures?.[wsControllerURL]?.[feature]
);

/**
    Returns the users current controller logged in identity
    @param wsControllerURL The controller url to make the query on.
    @param state The application state.
    @returns The users userTag.
  */
export const getActiveUserTag = createSelector(
  [
    slice,
    (state, wsControllerURL) => getControllerConnection(state, wsControllerURL),
  ],
  (_sliceState, controllerConnection) => controllerConnection?.user?.identity
);

export const getActiveUserControllerAccess = createSelector(
  [
    slice,
    (state, wsControllerURL) => getControllerConnection(state, wsControllerURL),
  ],
  (_sliceState, controllerConnection) =>
    controllerConnection?.user?.["controller-access"]
);

/**
  Checks state to see if the user is logged in.
  @param state The application state.
  @returns If the user is logged in.
*/
export const isLoggedIn = createSelector(
  [slice, (state, wsControllerURL) => getActiveUserTag(state, wsControllerURL)],
  (_sliceState, userTag) => !!userTag
);

/**
  Returns the fully qualified websocket controller API URL.
  @returns The memoized selector to return the controller websocket api url.
*/
export const getWSControllerURL = createSelector(
  getConfig,
  (config) => config?.controllerAPIEndpoint
);

export const isAuditLogsEnabled = createSelector(
  [getIsJuju, getWSControllerURL, (state) => state],
  (isJuju, wsControllerURL, state) =>
    !isJuju && getControllerFeatureEnabled(state, wsControllerURL, "auditLogs")
);

export const isCrossModelQueriesEnabled = createSelector(
  [getIsJuju, getWSControllerURL, (state) => state],
  (isJuju, wsControllerURL, state) =>
    !isJuju &&
    getControllerFeatureEnabled(state, wsControllerURL, "crossModelQueries")
);
