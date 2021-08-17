import { createSelector } from "reselect";

import type { ReduxState, ModelsList } from "types";
import type { ModelInfo, ModelWatcherData } from "./types";

const getModelWatcherData = (state: ReduxState): ModelWatcherData =>
  state.juju.modelWatcherData;
const getModelList = (state: ReduxState): ModelsList => state.juju.models;

export function getModelInfoByUUID(modelUUID: string) {
  return createSelector(
    getModelWatcherData,
    (modelWatcherData): ModelInfo | null => {
      if (modelWatcherData[modelUUID]) {
        return modelWatcherData[modelUUID].model;
      }
      return null;
    }
  );
}

export function getModelUUIDByName(modelName: string, ownerName: string) {
  return createSelector(getModelList, (modelList: ModelsList) => {
    let modelUUID = null;
    Object.entries(modelList).some(([key, { name, ownerTag, uuid }]) => {
      if (name === modelName && ownerTag.replace("user-", "") === ownerName) {
        modelUUID = uuid;
        return true;
      }
      return false;
    });
    return modelUUID;
  });
}
