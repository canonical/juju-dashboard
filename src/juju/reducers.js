import produce from "immer";

import { actionsList } from "./actions";

export default produce(
  (draftState, action) => {
    const payload = action.payload;
    switch (action.type) {
      case actionsList.updateModelList:
        const modelList = {};
        action.payload.userModels.forEach(model => {
          modelList[model.model.uuid] = {
            lastConnection: model.lastConnection,
            name: model.model.name,
            ownerTag: model.model.ownerTag,
            type: model.model.type,
            uuid: model.model.uuid
          };
        });
        draftState.models = modelList;
        break;
      case actionsList.updateModelStatus:
        draftState.modelStatuses[payload.modelUUID] = payload.status;
        break;
      case actionsList.updateModelInfo:
        const modelInfo = payload.results[0].result;
        draftState.modelInfo[modelInfo.uuid] = modelInfo;
        break;
      default:
        // No default value, fall through.
        break;
    }
  },
  {
    models: {},
    modelInfo: {},
    modelStatuses: {}
  }
);
