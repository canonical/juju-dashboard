import { createSelector } from "reselect";

import type { ReduxState } from "types";
import type { ModelInfo } from "./types";

const getModelWatcherData = (state: ReduxState) => state.juju.modelWatcherData;

export function getModelInfoByUUID(modelUUID: string) {
  return createSelector(
    getModelWatcherData,
    (modelWatcherData): ModelInfo | {} => {
      if (modelWatcherData[modelUUID]) {
        return modelWatcherData[modelUUID].model;
      }
      return {};
    }
  );
}
