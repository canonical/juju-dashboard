import { createSelector } from "reselect";

import { getApplicationStatusGroup, getUnitStatusGroup } from "./utils";

// ---- Selectors for top level keys
/**
  Fetches the model list from state.
  @param {Object} state The application state.
  @returns {Object|Null} The list of models or null if none found.
*/
const getModelList = state => {
  if (state.juju && state.juju.models) {
    return state.juju.models;
  }
  return null;
};

/**
  Fetches the model statuses from state.
  @param {Object} state The application state.
  @returns {Object|Null} The list of model statuses or null if none found.
*/
const getModelStatuses = state => {
  if (state.juju && state.juju.modelStatuses) {
    return state.juju.modelStatuses;
  }
  return null;
};

/**
  Fetches the model data from state.
  @param {Object} state The application state.
  @returns {Object|Null} The list of model data or null if none found.
*/
const getModelData = state => {
  if (state.juju && state.juju.modelData) {
    return state.juju.modelData;
  }
  return null;
};

// ---- Utility selectors

/**
  Pull the users macaroon credentials from state.
  @param {Object} state The application state.
  @returns {Object} The macaroons extracted from the bakery in state.
*/
const getUserCredentials = state => {
  let storedMacaroons = null;
  if (state.root && state.root.bakery) {
    storedMacaroons = state.root.bakery.storage._store.localStorage;
  }
  return storedMacaroons;
};

/**
  Base64 decode and json parse the supplied macaroons from the bakery.
  @param {Object} macaroons The macaroons data from the bakery.
  @returns {Object} The users decoded macaroons.
*/
const getDecodedMacaroons = macaroons => {
  if (!macaroons) {
    return null;
  }
  let decodedMacaroons = {};
  Object.keys(macaroons).forEach(key => {
    try {
      decodedMacaroons[key] = JSON.parse(atob(macaroons[key]));
    } catch (err) {
      console.error("Unable to decode macaroons", err);
    }
  });
  return decodedMacaroons;
};

/**
  Gets the model UUID from the supplied name.
  @param {String} name The name of the model.
  @param {Object} modelInfo The list of models.
  @returns {Object|Null} The model UUID or null if none found.
*/
const getModelUUIDByName = (name, modelInfo) => {
  let owner = null;
  let modelName = null;
  if (name.includes("/")) {
    [owner, modelName] = name.split("/");
  } else {
    modelName = name;
  }
  if (modelInfo) {
    for (let uuid in modelInfo) {
      const model = modelInfo[uuid];
      if (model.name === modelName) {
        if (owner) {
          if (model.ownerTag === `user-${owner}`) {
            // If this is a shared model then we'll also have an owner name
            return uuid;
          }
        } else {
          return uuid;
        }
      }
    }
  }
  return null;
};

/**
  Returns the modelStatus for the supplied modelUUID.
  @param {String} modelUUID
  @param {Object} modelStatuses
  @returns {Object|Null} The model status or null if none found
*/
const getModelStatusByUUID = (modelUUID, modelStatuses) => {
  if (modelStatuses && modelStatuses[modelUUID]) {
    return modelStatuses[modelUUID];
  }
  return null;
};

// Highest status to the right
const statusOrder = ["running", "alert", "blocked"];

/**
  Returns a grouped collection of model statuses.
  @param {Object} modelData
  @returns {Function} The grouped model statuses.
*/
const groupModelsByStatus = modelData => {
  const grouped = {
    blocked: [],
    alert: [],
    running: []
  };
  if (!modelData) {
    return grouped;
  }
  for (let modelUUID in modelData) {
    const model = modelData[modelUUID];
    let highestStatus = "running";
    Object.keys(model.applications).forEach(appName => {
      const app = model.applications[appName];
      const { status: appStatus } = getApplicationStatusGroup(app);
      if (statusOrder.indexOf(appStatus) > statusOrder.indexOf(highestStatus)) {
        highestStatus = appStatus;
      }
      if (highestStatus === statusOrder[-1]) {
        // If it's the highest status then we don't need to continue looping
        // applications or units.
        return;
      }
      Object.keys(app.units).forEach(unitId => {
        const unit = app.units[unitId];
        const { status: unitStatus } = getUnitStatusGroup(unit);
        if (unitStatus === "blocked") {
          grouped.blocked.push(model);
          return;
        }
      });
    });
    grouped[highestStatus].push(model);
  }
  return grouped;
};

/**
  Returns an object containing the grouped model status counts.
  @param {Object} groupedModelStatuses
  @returns {Function} The counts for each group of model statuses.
*/
const countModelStatusGroups = groupedModelStatuses => {
  const counts = {
    blocked: groupedModelStatuses.blocked.length,
    alert: groupedModelStatuses.alert.length,
    running: groupedModelStatuses.running.length
  };
  return counts;
};

// ----- Exported functions

/**
  Checks state to see if the sidebar is collapsible.
  Usage:
    const isSidebarCollapsible = useSelector(isSidebarCollapsible);

  @param {Object} state The application state.
  @returns {Boolean} If the sidebar is collapsible.
*/
export const isSidebarCollapsible = state => {
  if (state && state.root) {
    return state.root.collapsibleSidebar;
  }
};

/**
  Gets the model UUID from the supplied name using a memoized selector
  Usage:
    const getModelUUIDMemo = useMemo(getModelUUID.bind(null, modelName), [
      modelName
    ]);

  @param {String} modelName The name of the model.
  @returns {Function} The memoized selector to return a modelUUID.
*/
export const getModelUUID = modelName => {
  return createSelector(
    getModelList,
    modelInfo => getModelUUIDByName(modelName, modelInfo)
  );
};

/**
  Gets the model UUID from the supplied name using a memoized selector
  Usage:
    const macaroons = useSelector(getMacaroons);

  @returns {Function} The memoized selector to return the users macaroons.
*/
export const getMacaroons = createSelector(
  getUserCredentials,
  getDecodedMacaroons
);

/**
  Checks state to see if the user is logged in.
  Usage:
    const userIsLoggedIn = useSelector(isLoggedIn);

  @param {Object} state The application state.
  @returns {Boolean} If the user is logged in.
*/
export const isLoggedIn = state =>
  state.root.controllerConnection && state.root.bakery;

/**
  Returns the users current controller logged in identity
  @param {Object} state The application state.
  @returns {String} The users userTag.
*/
export const getActiveUserTag = state =>
  state.root.controllerConnection &&
  state.root.controllerConnection.info.user.identity;

/**
  Returns a model status for the supplied modelUUID.
  @param {String} modelUUID The model UUID to fetch the status for
  @returns {Function} The memoized selector to return the model status.
*/
export const getModelStatus = modelUUID => {
  return createSelector(
    getModelStatuses,
    modelStatuses => getModelStatusByUUID(modelUUID, modelStatuses)
  );
};

/**
  Returns the model statuses sorted by status.
  @returns {Function} The memoized selector to return the sorted model statuses.
*/
export const getGroupedModelData = createSelector(
  getModelData,
  groupModelsByStatus
);

/**
  Returns the counts of the model statuses
  @returns {Function} The memoized selector to return the model status counts.
*/
export const getGroupedModelStatusCounts = createSelector(
  getGroupedModelData,
  countModelStatusGroups
);
