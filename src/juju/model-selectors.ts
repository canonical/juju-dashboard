import { createSelector } from "reselect";

import type { ReduxState, ModelsList } from "types";
import type {
  ApplicationData,
  ModelInfo,
  ModelWatcherData,
  UnitData,
} from "./types";

const getModelWatcherData = (state: ReduxState): ModelWatcherData =>
  state.juju.modelWatcherData;
const getModelList = (state: ReduxState): ModelsList => state.juju.models;

export function getModelWatcherDataByUUID(modelUUID: string) {
  return createSelector(getModelWatcherData, (modelWatcherData) => {
    if (modelWatcherData[modelUUID]) {
      return modelWatcherData[modelUUID];
    }
    return null;
  });
}

export function getModelInfo(modelUUID: string) {
  return createSelector(
    getModelWatcherDataByUUID(modelUUID),
    (modelWatcherData): ModelInfo | null => {
      if (modelWatcherData) {
        return modelWatcherData.model;
      }
      return null;
    }
  );
}

export function getModelUUID(modelName: string, ownerName: string) {
  return createSelector(getModelList, (modelList: ModelsList) => {
    let modelUUID = "";
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

export function getModelApplications(modelUUID: string) {
  return createSelector(
    getModelWatcherDataByUUID(modelUUID),
    (modelWatcherData): ApplicationData | null => {
      if (modelWatcherData) {
        return modelWatcherData.applications;
      }
      return null;
    }
  );
}

export function getModelUnits(modelUUID: string) {
  return createSelector(
    getModelWatcherDataByUUID(modelUUID),
    (modelWatcherData): UnitData | null => {
      if (modelWatcherData) {
        return modelWatcherData.units;
      }
      return null;
    }
  );
}
