import produce from "immer";

import { actionsList } from "./actions";

export default function jujuReducers(state = {}, action) {
  return produce(state, draftState => {
    // The below is required because CRA ignores the eslint configuration file
    // during development and adds warnings in the dev console.
    // eslint-disable-next-line default-case
    switch (action.type) {
      case actionsList.updateModelList:
        const modelList = action.payload.userModels.map(model => {
          return {
            lastConnection: model.lastConnection,
            name: model.model.name,
            ownerTag: model.model.ownerTag,
            type: model.model.type,
            uuid: model.model.uuid
          };
        });
        draftState.models = { items: modelList };
        break;
    }
  });
}
