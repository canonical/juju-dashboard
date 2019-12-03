import { fetchAndStoreModelStatus } from "juju";
import { isLoggedIn } from "app/selectors";

// Action labels
export const actionsList = {
  clearModelData: "CLEAR_MODEL_DATA",
  fetchModelList: "FETCH_MODEL_LIST",
  updateModelInfo: "UPDATE_MODEL_INFO",
  updateModelStatus: "UPDATE_MODEL_STATUS",
  updateModelList: "UPDATE_MODEL_LIST"
};

// Action creators

export function clearModelData() {
  return {
    type: actionsList.clearModelData
  };
}

// Thunks

/**
  @param {Array} models The list of models to store.
*/
export function updateModelList(models) {
  return function updateModelList(dispatch, getState) {
    if (isLoggedIn(getState())) {
      dispatch({
        type: actionsList.updateModelList,
        payload: models
      });
    }
  };
}

/**
  @param {String} modelUUID The modelUUID of the model to store the
    status under.
  @param {Object} status The status data as returned from the API.
 */
export function updateModelStatus(modelUUID, status) {
  return function updateModelStatus(dispatch, getState) {
    if (isLoggedIn(getState())) {
      dispatch({
        type: actionsList.updateModelStatus,
        payload: {
          modelUUID,
          status
        }
      });
    }
  };
}

/**
  @param {Object} modelInfo The model info data as returned from the API.
 */
export function updateModelInfo(modelInfo) {
  return function updateModelInfo(dispatch, getState) {
    if (isLoggedIn(getState())) {
      dispatch({
        type: actionsList.updateModelInfo,
        payload: modelInfo
      });
    }
  };
}

/**
  Fetches the model list from the supplied Juju controller. Requires that the
  user is logged in to dispatch the retrieved data from listModels.
  @returns {Object} models The list of model objects under the key `userModels`.
*/
export function fetchModelList() {
  return async function fetchModelList(dispatch, getState) {
    const state = getState();
    const conn = state.root.controllerConnection;
    const modelManager = conn.facades.modelManager;
    // Checks are made twice as it's possible that the user becomes logged out
    // after the request is made but before the data is returned.
    if (isLoggedIn(state)) {
      const models = await modelManager.listModels({ tag: conn.info.identity });
      dispatch(updateModelList(models));
    }
  };
}

export function fetchModelStatus(modelUUID) {
  return async function fetchModelStatus(dispatch, getState) {
    const jujuState = getState().juju;
    if (jujuState.modelStatuses && jujuState.modelStatuses[modelUUID]) {
      // It already exists, don't do anything as it'll be updated shortly
      // by the polling loop.
      return;
    }
    fetchAndStoreModelStatus(modelUUID, dispatch, getState);
  };
}
