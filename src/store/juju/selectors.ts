import { createSelector } from "reselect";

import { RootState } from "store/store";

import type {
  AnnotationData,
  ApplicationData,
  MachineData,
  ModelInfo,
  RelationData,
  UnitData,
} from "juju/types";

import type { ModelsList } from "./types";

const slice = (state: RootState) => state.juju;

/**
  Fetches the model data from state.
  @param state The application state.
  @returns The list of model data or null if none found.
*/
export const getModelData = createSelector(
  [slice],
  (sliceState) => sliceState.modelData ?? null
);

/**
  Fetches the controller data from state.
  @param state The application state.
  @returns The list of controller data or null if none found.
*/
export const getControllerData = createSelector(
  [slice],
  (sliceState) => sliceState.controllers
);

const getModelWatcherData = createSelector(
  [slice],
  (sliceState) => sliceState.modelWatcherData
);

const getModelList = createSelector([slice], (sliceState) => sliceState.models);

export function getModelWatcherDataByUUID(modelUUID: string) {
  return createSelector(getModelWatcherData, (modelWatcherData) => {
    if (modelWatcherData?.[modelUUID]) {
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

export function getModelUUID(
  modelName?: string | null,
  ownerName?: string | null
) {
  return createSelector(getModelList, (modelList: ModelsList) => {
    let modelUUID = "";
    if (!modelList || !modelName || !ownerName) {
      return modelUUID;
    }
    Object.entries(modelList).some(([_key, { name, ownerTag, uuid }]) => {
      if (name === modelName && ownerTag.replace("user-", "") === ownerName) {
        modelUUID = uuid;
        return true;
      }
      return false;
    });
    return modelUUID;
  });
}

export function getModelAnnotations(modelUUID: string) {
  return createSelector(
    getModelWatcherDataByUUID(modelUUID),
    (modelWatcherData): AnnotationData | null => {
      if (modelWatcherData) {
        return modelWatcherData.annotations;
      }
      return null;
    }
  );
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

export function getModelRelations(modelUUID: string) {
  return createSelector(
    getModelWatcherDataByUUID(modelUUID),
    (modelWatcherData): RelationData | null => {
      if (modelWatcherData) {
        return modelWatcherData.relations;
      }
      return null;
    }
  );
}

export function getModelMachines(modelUUID: string) {
  return createSelector(
    getModelWatcherDataByUUID(modelUUID),
    (modelWatcherData): MachineData | null => {
      if (modelWatcherData) {
        return modelWatcherData.machines;
      }
      return null;
    }
  );
}

// The order of this enum is important. It needs to be organized in order of
// best to worst status.
export enum Statuses {
  running,
  alert,
  blocked,
}

export interface StatusData {
  // keyof typeof returns the list of string keys in the Statuses enum
  // not the numeric indexes generated at compile time.
  [applicationName: string]: keyof typeof Statuses;
}

/**
  Returns an object of key value pairs indicating an
  applications aggregate unit status.
*/
export function getAllModelApplicationStatus(modelUUID: string) {
  return createSelector(
    getModelUnits(modelUUID),
    (units): StatusData | null => {
      if (!units) {
        return null;
      }

      const applicationStatuses: StatusData = {};
      // Convert the various unit statuses into our three current
      // status types "blocked", "alert", "running".
      Object.entries(units).forEach(([_unitId, unitData]) => {
        let workloadStatus = Statuses.running;
        switch (unitData["workload-status"].current) {
          case "maintenance":
          case "waiting":
            workloadStatus = Statuses.alert;
            break;
          case "blocked":
            workloadStatus = Statuses.blocked;
            break;
        }

        let agentStatus = Statuses.running;
        switch (unitData["agent-status"].current) {
          case "allocating":
          case "executing":
          case "rebooting":
            agentStatus = Statuses.alert;
            break;
          case "failed":
          case "lost":
            agentStatus = Statuses.blocked;
            break;
        }
        // Use the enum index to determine the worst status value.
        const worstStatusIndex = Math.max(
          workloadStatus,
          agentStatus,
          Statuses.running
        );

        applicationStatuses[unitData.application] = Statuses[
          worstStatusIndex
        ] as keyof typeof Statuses;
      });

      return applicationStatuses;
    }
  );
}
