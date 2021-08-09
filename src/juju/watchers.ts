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
    const modelUUID = delta[2]["model-uuid"];
    switch (delta[0]) {
      case "model":
        switch (delta[1]) {
          case "change":
            if (!modelWatcherData[modelUUID]) {
              modelWatcherData[modelUUID] = generateModelWatcherBase();
            }
            mergeWith(modelWatcherData[modelUUID].model, delta[2]);
            break;
        }
        break;
    }
  });
  return modelWatcherData;
}
