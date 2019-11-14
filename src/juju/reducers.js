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
        const modelUUID = payload.modelUUID;

        if (!draftState.modelData[modelUUID]) {
          draftState.modelData[modelUUID] = {};
        }
        // There is some data that we don't want to store because it changes
        // to often causing needless re-renders and is currently irrelevent
        // like controllerTimestamp so we have a whitelist for top level keys.
        const allowedKeys = [
          "applications",
          "machines",
          "model",
          "offers",
          "relations",
          "remoteApplications"
        ];

        allowedKeys.forEach(key => {
          draftState.modelData[modelUUID][key] = payload.status[key];
        });
        // The status doesn't contain a top level uuid and when this data is
        // fetched it doesn't contain the UUID.
        draftState.modelData[modelUUID].uuid = modelUUID;
        break;
      case actionsList.updateModelInfo:
        const modelInfo = payload.results[0].result;
        // There don't appear to be any irrelevent data in the modelInfo so
        // we overwrite the whole object every time it changes even though
        // mostly that'll just be status timestamps.
        const modelData = draftState.modelData[modelInfo.uuid];
        // If any of the status requests timeout then it's possible the data
        // won't be available. Just abandon saving any data in that case.
        // This will go away with the new API.
        if (modelData) {
          draftState.modelData[modelInfo.uuid].info = modelInfo;
        }
        break;
      default:
        // No default value, fall through.
        break;
    }
  },
  {
    models: {},
    modelData: {}
  }
);
