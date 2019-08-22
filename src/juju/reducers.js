import produce from "immer";

import { actionsList } from "./actions";

export default produce(
  (draftState, action) => {
    // The below is required because CRA ignores the eslint configuration file
    // during development and adds warnings in the dev console.
    // eslint-disable-next-line default-case
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
