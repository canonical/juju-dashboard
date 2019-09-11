/**
  Checks state to see if the user is logged in.
  @returns {Boolean} If the user is logged in.
*/
export const isLoggedIn = state =>
  state.root.controllerConnection && state.root.bakery;

/**
  Pull the users macaroon credentials from state, base64 decode and json parse.
  @returns {Object} The users macaroons in an object with a `macaroons` key.
    It's an object because this can be expanded to include user/pass credential
    keys in the future without changing the data type.
*/
export const getUserCredentials = state => {
  let decodedMacaroons = {};
  if (state.root && state.root.bakery) {
    const storedMacaroons = state.root.bakery.storage._store._items;
    Object.keys(storedMacaroons).forEach(key => {
      decodedMacaroons[key] = JSON.parse(atob(storedMacaroons[key]));
    });
  }
  return { macaroons: decodedMacaroons };
};
