import mergeWith from "lodash.mergewith";

import type {
  AllWatcherDelta,
  DeltaEntityTypes,
  DeltaMessageData,
  ModelData,
  ModelWatcherData,
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
  entityType: DeltaEntityTypes,
  key: string
): void {
  if (actionType === "change") {
    const formatted = {
      [key]: delta,
    };
    mergeWith(modelData[entityType], formatted);
  } else if (actionType === "remove") {
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
    if (delta[0] === "action") {
      _process("actions", delta[2].id);
    }
    if (delta[0] === "application") {
      _process("applications", delta[2].name);
    }
    if (delta[0] === "charm") {
      _process("charms", delta[2]["charm-url"]);
    }
    if (delta[0] === "machine") {
      _process("machines", delta[2].id);
    }
    if (delta[0] === "model") {
      if (delta[1] === "change") {
        mergeWith(modelWatcherData[modelUUID].model, delta[2]);
      }
    }
    if (delta[0] === "relation") {
      _process("relations", delta[2].key);
    }
    if (delta[0] === "unit") {
      _process("units", delta[2].name);
    }
  });
  return modelWatcherData;
}
