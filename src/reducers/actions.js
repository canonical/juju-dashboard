// Action labels
export const actionsList = {
  storeBakery: "STORE_BAKERY",
  updateControllerConnection: "UPDATE_CONTROLLER_CONNECTION"
};

// Action creators
/**
  @param {Bakery} bakery The instance of the bakery that's to be used for the
  application to interact as the active user. This bakery contains private data
  and should not be dumped wholesale from the redux store.
*/
export function storeBakery(bakery) {
  return {
    type: actionsList.storeBakery,
    payload: bakery
  };
}

/**
  @param {Object} conn The active controller connection.
*/
export function updateControllerConnection(conn) {
  return {
    type: actionsList.updateControllerConnection,
    payload: conn
  };
}
