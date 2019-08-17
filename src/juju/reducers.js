import produce from "immer";

import { actionsList } from "./actions";

/* eslint-disable default-case */
// immer handles the default case so one isn't needed.
export default function jujuReducers(state = {}, action) {
  return produce(state, draftState => {
    switch (action.type) {
      case actionsList.updateModelList:
        const modelList = action.models.map(model => {
          return {
            lastConnection: model.lastConnection,
            name: model.model.name,
            ownerTag: model.model.ownerTag,
            type: model.model.type,
            uuid: model.model.uuid
          };
        });
        draftState.models = modelList;
        break;
    }
  });
}
