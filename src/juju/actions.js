// Action labels
export const actionsList = {
  updateModelList: "UPDATE_MODEL_LIST"
};

// Action creators
export function updateModelList(models) {
  return {
    type: actionsList.updateModelList,
    payload: models
  };
}
