import produce from "immer";

import { actionsList } from "./actions";

export default produce(
  (draftState, action) => {
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
        draftState.models.items = modelList;
        break;
      case actionsList.updateModelStatus:
        const payload = action.payload;
        draftState.models.items[payload.modelUUID].status = payload.status;
    }
  },
  {
    models: { items: {} }
  }
);
