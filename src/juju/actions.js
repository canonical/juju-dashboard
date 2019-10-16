import { fetchAndStoreModelStatus } from "juju";

// Action labels
export const actionsList = {
  fetchModelList: "FETCH_MODEL_LIST",
  updateModelInfo: "UPDATE_MODEL_INFO",
  updateModelStatus: "UPDATE_MODEL_STATUS",
  updateModelList: "UPDATE_MODEL_LIST"
};

// Action creators
/**
  @param {Array} models The list of models to store.
  @returns {Object} An action for Redux.
*/
export function updateModelList(models) {
  return {
    type: actionsList.updateModelList,
    payload: models
  };
}

/**
  @param {String} modelUUID The modelUUID of the model to store the
    status under.
  @param {Object} status The status data as returned from the API.
  @returns {Object} An action for Redux.
 */
export function updateModelStatus(modelUUID, status) {
  return {
    type: actionsList.updateModelStatus,
    payload: {
      modelUUID,
      status
    }
  };
}

/**
  @param {Object} modelInfo The model info data as returned from the API.
  @returns {Object} An action for Redux.
 */
export function updateModelInfo(modelInfo) {
  return {
    type: actionsList.updateModelInfo,
    payload: modelInfo
  };
}

// Thunks

/**
  Fetches the model list from the supplied Juju controller.
  @returns {Object} models The list of model objects under the key `userModels`.
*/
export function fetchModelList() {
  return async function thunk(dispatch, getState) {
    const conn = getState().root.controllerConnection;
    const modelManager = conn.facades.modelManager;
    const models = await modelManager.listModels({ tag: conn.info.identity });
    dispatch(updateModelList(models));
  };
}

export function fetchModelStatus(modelUUID) {
  return async function thunk(dispatch, getState) {
    const jujuState = getState().juju;
    if (jujuState.modelStatuses && jujuState.modelStatuses[modelUUID]) {
      // It already exists, don't do anything as it'll be updated shortly
      // by the polling loop.
      return;
    }
    fetchAndStoreModelStatus(modelUUID, dispatch);
  };
}
