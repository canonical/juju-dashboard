import { createSelector } from "reselect";
import {
  getModelStatusGroupData,
  extractOwnerName,
  extractCloudName
} from "./utils";

// ---- Selectors for top level keys

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

/**
  Fetches the controller data from state.
  @param {Object} state The application state.
  @returns {Object|Null} The list of controller data or null if none found.
*/
export const getControllerData = state => {
  if (state.juju && state.juju.controllers) {
    return state.juju.controllers;
  }
  return null;
};

/**
  Fetches the bakery from state.
  @param {Object} state The application state.
  @returns {Object|Null} The bakery instance or null if none found.
*/
export const getBakery = state => {
  if (state.root && state.root.bakery) {
    return state.root.bakery;
  }
  return null;
};

/**
  Fetches the juju api instance from state.
  @param {Object} state The application state.
  @returns {Object|Null} The juju api instance or null if none found.
*/
export const getJujuAPIInstance = state => {
  if (state.root && state.root.juju) {
    return state.root.juju;
  }
  return null;
};

/**
  Fetches the pinger intervalId from state.
  @param {Object} state The application state.
  @returns {Object|Null} The pinger intervalId or null if none found.
*/
export const getPingerIntervalId = state => {
  if (state.root && state.root.pingerIntervalId) {
    return state.root.pingerIntervalId;
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
    storedMacaroons = state.root.bakery.storage._store;
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
  @param {Object} modelData The list of models.
  @returns {Object|Null} The model UUID or null if none found.
*/
const getModelUUIDByName = (name, modelData) => {
  let owner = null;
  let modelName = null;
  if (name.includes("/")) {
    [owner, modelName] = name.split("/");
  } else {
    modelName = name;
  }
  if (modelData) {
    for (let uuid in modelData) {
      const model = modelData[uuid].info;
      if (model && model.name === modelName) {
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
  @param {Object} modelData
  @returns {Object|Null} The model status or null if none found
*/
const getModelDataByUUID = (modelUUID, modelData) => {
  if (modelData && modelData[modelUUID]) {
    return modelData[modelUUID];
  }
  return null;
};

/**
  Returns a grouped collection of model statuses.
  @param {Object} modelData
  @returns {Object} The grouped model statuses.
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
    const { highestStatus } = getModelStatusGroupData(model);
    grouped[highestStatus].push(model);
  }
  return grouped;
};

/**
  Returns a grouped collection of model statuses by owner.
  @param {Object} modelData
  @returns {Object} The grouped model statuses by owner.
*/
const groupModelsByOwner = modelData => {
  const grouped = {};
  if (!modelData) {
    return grouped;
  }
  for (let modelUUID in modelData) {
    const model = modelData[modelUUID];
    if (model.info) {
      const owner = extractOwnerName(model.info.ownerTag);
      if (!grouped[owner]) {
        grouped[owner] = [];
      }
      grouped[owner].push(model);
    }
  }
  return grouped;
};

/**
  Returns an object containing the number of models, applications and units.
  @param {Object} countModelData
  @returns {Object} The set of model data counts.
*/
const countModelData = modelData => {
  let machinesCount = 0;
  let applicationCount = 0;
  let unitCount = 0;

  for (const modelUUID in modelData) {
    const applications = modelData[modelUUID].applications;
    applicationCount += Object.keys(applications).length;
    for (const applicationID in applications) {
      unitCount += Object.keys(applications[applicationID].units).length;
    }
    machinesCount += Object.keys(modelData[modelUUID].machines).length;
  }
  return {
    applicationCount,
    machinesCount,
    unitCount
  };
};

/**
  Returns a grouped collection of model statuses by cloud.
  @param {Object} modelData
  @returns {Object} The grouped model statuses by cloud.
*/
const groupModelsByCloud = modelData => {
  const grouped = {};
  if (!modelData) {
    return grouped;
  }
  for (let modelUUID in modelData) {
    const model = modelData[modelUUID];
    if (model.info) {
      const cloud = extractCloudName(model.info.cloudTag);
      if (!grouped[cloud]) {
        grouped[cloud] = [];
      }
      grouped[cloud].push(model);
    }
  }
  return grouped;
};

/**
  Returns an object containing the grouped model status counts.
  @param {Object} groupedModelStatuses
  @returns {Object} The counts for each group of model statuses.
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
  return createSelector(getModelData, modelData =>
    getModelUUIDByName(modelName, modelData)
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
  state.root.controllerConnection &&
  state.root.bakery &&
  state.root.bakery.storage._store.identity;

export const isConnecting = state => !!state.root.visitURL;
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
  return createSelector(getModelData, modelData =>
    getModelDataByUUID(modelUUID, modelData)
  );
};

/**
  Returns the model statuses sorted by status.
  @returns {Function} The memoized selector to return the sorted model statuses.
*/
export const getGroupedModelDataByStatus = createSelector(
  getModelData,
  groupModelsByStatus
);

/**
  Returns the model statuses sorted by owner.
  @returns {Function} The memoized selector to return the models
    grouped by owner.
*/
export const getGroupedModelDataByOwner = createSelector(
  getModelData,
  groupModelsByOwner
);

/**
  Returns the model statuses sorted by cloud.
  @returns {Function} The memoized selector to return the models
    grouped by cloud.
*/
export const getGroupedModelDataByCloud = createSelector(
  getModelData,
  groupModelsByCloud
);

/**
  Returns the counts of the model statuses
  @returns {Function} The memoized selector to return the model status counts.
*/
export const getGroupedModelStatusCounts = createSelector(
  getGroupedModelDataByStatus,
  countModelStatusGroups
);
