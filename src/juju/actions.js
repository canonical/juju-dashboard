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
*/
export function updateModelList(models) {
  return {
    type: actionsList.updateModelList,
    payload: models
  };
}

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
