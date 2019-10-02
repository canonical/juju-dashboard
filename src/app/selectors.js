/**
  Checks state to see if the user is logged in.
  @param {Object} state The application state.
  @returns {Boolean} If the user is logged in.
*/
export const isLoggedIn = state =>
  state.root.controllerConnection && state.root.bakery;

/**
  Pull the users macaroon credentials from state.
  @param {Object} state The application state.
  @returns {Object} The macaroons extracted from the bakery in state.
*/
export const getUserCredentials = state => {
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
export const getDecodedMacaroons = macaroons => {
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
  Fetches the model list from state.
  @param {Object} state The application state.
  @returns {Object|Null} The list of models or null if none found.
*/
export const getModelList = state => {
  if (state.juju && state.juju.models) {
    return state.juju.models;
  }
  return null;
};

/**
  Gets the model UUID from the supplied name.
  @param {String} name The name of the model.
  @param {Object} modelInfo The list of models.
  @returns {Object|Null} The model UUID or null if none found.
*/
export const getModelUUIDByName = (name, modelInfo) => {
  if (modelInfo) {
    for (let uuid in modelInfo) {
      if (modelInfo[uuid].name === name) {
        return uuid;
      }
    }
  }
  return null;
};
