import mergeWith from "lodash.mergewith";

import type { AllWatcherDelta, ModelData, ModelWatcherData } from "./types";

function generateModelWatcherBase(): ModelData {
  return {
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
    charms: {},
  };
}

export function processDeltas(
  modelWatcherData: ModelWatcherData,
  deltas: AllWatcherDelta[]
) {
  if (!deltas) {
    return;
  }
  deltas.forEach((delta) => {
    // Delta is in the format [entityType, actionType, data].
    const modelUUID = delta[2]["model-uuid"];
    if (!modelWatcherData[modelUUID]) {
      modelWatcherData[modelUUID] = generateModelWatcherBase();
    }
    switch (delta[0]) {
      case "model":
        switch (delta[1]) {
          case "change":
            mergeWith(modelWatcherData[modelUUID].model, delta[2]);
            break;
        }
        break;
      case "charm":
        switch (delta[1]) {
          case "change":
            const formatted = {
              [delta[2]["charm-url"]]: delta[2],
            };
            mergeWith(modelWatcherData[modelUUID].charms, formatted);
            break;
        }
        break;
    }
  });
  return modelWatcherData;
}
