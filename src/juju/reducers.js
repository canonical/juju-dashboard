import { actionsList } from "./actions";

export default function jujuReducers(state = {}, action) {
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
      return { models: modelList };
      break; // eslint-disable-line no-unreachable
    default:
      return state;
      break; // eslint-disable-line no-unreachable
  }
}
