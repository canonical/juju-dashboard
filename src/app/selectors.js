import { createSelector } from "reselect";

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

// ---- Utility selectors

/**
  Pull the users macaroon credentials from state.
  @param {Object} state The application state.
  @returns {Object} The macaroons extracted from the bakery in state.
*/
const getUserCredentials = state => {
  let storedMacaroons = null;
  if (state.root && state.root.bakery) {
    storedMacaroons = state.root.bakery.storage._store._items;
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
  if (modelInfo) {
    for (let uuid in modelInfo) {
      if (modelInfo[uuid].name === name) {
        return uuid;
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

// ----- Exported functions

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

*/
export const getModelStatus = modelUUID => {
  return createSelector(
    getModelStatuses,
    modelStatuses => getModelStatusByUUID(modelUUID, modelStatuses)
  );
};
