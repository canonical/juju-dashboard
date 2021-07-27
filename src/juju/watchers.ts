import mergeWith from "lodash.mergewith";

import type { AllWatcherDelta, ModelData, ModelWatcherData } from "./types";

function generateModelWatcherBase(): ModelData {
  return {
    model: {
      "model-uuid": "",
      name: "",
      life: "",
      owner: "",
      "controller-uuid": "",
      "is-controller": false,
      config: {},
      status: {
        current: "",
        message: "",
        since: "",
        version: "",
      },
      constraints: {},
      sla: {
        level: "",
        owner: "",
      },
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
  console.log(deltas);
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
