import mergeWith from "lodash.mergewith";

import type {
  AllWatcherDelta,
  DeltaMessageData,
  ModelData,
  ModelWatcherData,
} from "./types";

import {
  DeltaChangeTypes,
  DeltaEntityTypes,
  ReduxDeltaEntityTypes,
} from "./types";

function generateModelWatcherBase(): ModelData {
  return {
    actions: {},
    applications: {},
    charms: {},
    machines: {},
    model: {
      "cloud-tag": "",
      "controller-uuid": "",
      "is-controller": false,
      "model-uuid": "",
      config: {},
      constraints: {},
      life: "",
      name: "",
      owner: "",
      region: "",
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

function _processDelta(
  actionType: string,
  delta: DeltaMessageData,
  modelData: ModelData,
  entityType: ReduxDeltaEntityTypes,
  key: string
): void {
  if (actionType === DeltaChangeTypes.CHANGE) {
    const formatted = {
      [key]: delta,
    };
    mergeWith(modelData[entityType], formatted);
  } else if (
    actionType === DeltaChangeTypes.REMOVE &&
    entityType !== ReduxDeltaEntityTypes.MODEL
  ) {
    delete modelData[entityType][key];
  }
}

export function processDeltas(
  modelWatcherData: ModelWatcherData,
  deltas: AllWatcherDelta[]
) {
  if (!deltas) {
    return;
  }
  deltas.forEach((delta) => {
    // Delta is in the format of [entityType, actionType, data].
    const modelUUID = delta[2]["model-uuid"];
    if (!modelWatcherData[modelUUID]) {
      modelWatcherData[modelUUID] = generateModelWatcherBase();
    }
    const modelData = modelWatcherData[modelUUID];
    const _process = _processDelta.bind(null, delta[1], delta[2], modelData);
    if (delta[0] === DeltaEntityTypes.ACTION) {
      _process(ReduxDeltaEntityTypes.ACTIONS, delta[2].id);
    } else if (delta[0] === DeltaEntityTypes.APPLICATION) {
      _process(ReduxDeltaEntityTypes.APPLICATIONS, delta[2].name);
    } else if (delta[0] === DeltaEntityTypes.CHARM) {
      _process(ReduxDeltaEntityTypes.CHARMS, delta[2]["charm-url"]);
    } else if (delta[0] === DeltaEntityTypes.MACHINE) {
      _process(ReduxDeltaEntityTypes.MACHINES, delta[2].id);
    } else if (delta[0] === DeltaEntityTypes.MODEL) {
      if (delta[1] === DeltaChangeTypes.CHANGE) {
        mergeWith(modelWatcherData[modelUUID].model, delta[2]);
      }
    } else if (delta[0] === DeltaEntityTypes.RELATION) {
      _process(ReduxDeltaEntityTypes.RELATIONS, delta[2].key);
    } else if (delta[0] === DeltaEntityTypes.UNIT) {
      _process(ReduxDeltaEntityTypes.UNITS, delta[2].name);
    }
  });
  return modelWatcherData;
}
