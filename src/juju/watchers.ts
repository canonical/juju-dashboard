import mergeWith from "lodash.mergewith";

import type {
  AllWatcherDelta,
  ApplicationData,
  DeltaMessageData,
  WatcherModelData,
  ModelWatcherData,
} from "./types";
import {
  DeltaChangeTypes,
  DeltaEntityTypes,
  ReduxDeltaEntityTypes,
} from "./types";

export function generateModelWatcherBase(): WatcherModelData {
  return {
    actions: {},
    annotations: {},
    applications: {},
    charms: {},
    machines: {},
    model: {
      cloud: "",
      "controller-uuid": "",
      "is-controller": false,
      "model-uuid": "",
      config: {},
      constraints: {},
      life: "",
      name: "",
      owner: "",
      "cloud-region": "",
      sla: {
        level: "",
        owner: "",
      },
      status: {
        current: "",
        message: "",
        since: "",
        version: "",
      },
      type: "",
      version: "",
    },
    relations: {},
    units: {},
  };
}

function _processDelta<M extends WatcherModelData, E extends keyof M>(
  actionType: string,
  delta: DeltaMessageData,
  modelData: M,
  entityType: E,
  entityId: string
): void {
  if (actionType === DeltaChangeTypes.CHANGE) {
    // The 'change' delta is used for adding and modifying entities so no need
    // to check if the entity already exists in the store.
    const formatted = {
      [entityId]: delta,
    };
    mergeWith(modelData[entityType], formatted);
  } else if (actionType === DeltaChangeTypes.REMOVE && entityType !== "model") {
    if (entityId in modelData[entityType]) {
      delete modelData[entityType][entityId as keyof M[E]];
    }
  }
}

export function processDeltas(
  modelWatcherData?: ModelWatcherData,
  deltas?: AllWatcherDelta[]
) {
  if (!modelWatcherData || !deltas) {
    return;
  }
  deltas.forEach(([deltaEntityType, deltaActionType, deltaData]) => {
    // Delta is in the format of [entityType, actionType, data].
    const modelUUID = deltaData["model-uuid"];
    if (!modelWatcherData[modelUUID]) {
      modelWatcherData[modelUUID] = generateModelWatcherBase();
    }
    const modelData = modelWatcherData[modelUUID];
    const _process = _processDelta.bind(
      null,
      deltaActionType,
      deltaData,
      modelData
    );
    if (deltaEntityType === DeltaEntityTypes.ACTION) {
      _process(ReduxDeltaEntityTypes.ACTIONS, deltaData.id);
    } else if (deltaEntityType === DeltaEntityTypes.ANNOTATION) {
      const appName = deltaData.tag.replace("application-", "");
      const formatted = {
        [appName]: deltaData.annotations,
      };
      mergeWith(modelData.annotations, formatted);
    } else if (deltaEntityType === DeltaEntityTypes.APPLICATION) {
      const formatted: ApplicationData = {
        [deltaData.name]: deltaData,
      };
      if (formatted[deltaData.name]["unit-count"] === undefined) {
        formatted[deltaData.name]["unit-count"] = 0;
      }
      mergeWith(modelData.applications, formatted);
    } else if (deltaEntityType === DeltaEntityTypes.CHARM) {
      _process(ReduxDeltaEntityTypes.CHARMS, deltaData["charm-url"]);
    } else if (deltaEntityType === DeltaEntityTypes.MACHINE) {
      _process(ReduxDeltaEntityTypes.MACHINES, deltaData.id);
    } else if (deltaEntityType === DeltaEntityTypes.MODEL) {
      if (deltaActionType === DeltaChangeTypes.CHANGE) {
        mergeWith(modelWatcherData[modelUUID].model, deltaData);
      }
    } else if (deltaEntityType === DeltaEntityTypes.RELATION) {
      _process(ReduxDeltaEntityTypes.RELATIONS, deltaData.key);
    } else if (deltaEntityType === DeltaEntityTypes.UNIT) {
      _process(ReduxDeltaEntityTypes.UNITS, deltaData.name);
      const applicationUnitCounts: { [key: string]: number } = {};
      // We loop through the full modelData units list every time there is a
      // unit delta so that we don't have to keep reference to the delta type
      // when adding and removing units to other applications. At the time
      // of writing this does not appear to be a performance issue but something
      // to keep an eye on for those with many hundreds of units.
      Object.entries(modelData.units).forEach(([key, value]) => {
        const applicationName = key.split("/")[0];
        if (applicationUnitCounts[applicationName] === undefined) {
          applicationUnitCounts[applicationName] = 0;
        }
        applicationUnitCounts[applicationName] += 1;
      });
      Object.entries(applicationUnitCounts).forEach(
        ([applicationName, count]) => {
          if (!modelData.applications[applicationName]) {
            // Sometimes the unit delta is parsed
            // before the application delta arrives so it needs to
            // store this information before it gets merged with the rest of the
            // application info.
            modelData.applications[applicationName] = { "unit-count": count };
          } else {
            modelData.applications[applicationName]["unit-count"] = count;
          }
        }
      );
    }
  });
  return modelWatcherData;
}
