import mergeWith from "lodash.mergewith";

import type { AllWatcherDelta, ModelData, ModelWatcherData } from "./types";

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
    switch (delta[0]) {
      case "action":
        switch (delta[1]) {
          case "change":
            const formatted = {
              [delta[2].id]: delta[2],
            };
            mergeWith(modelWatcherData[modelUUID].actions, formatted);
            break;
        }
        break;
      case "application":
        switch (delta[1]) {
          case "change":
            const formatted = {
              [delta[2].name]: delta[2],
            };
            mergeWith(modelWatcherData[modelUUID].applications, formatted);
            break;
          case "remove":
            delete modelWatcherData[modelUUID].applications[delta[2].name];
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
          case "remove":
            delete modelWatcherData[modelUUID].charms[delta[2]["charm-url"]];
            break;
        }
        break;
      case "machine":
        switch (delta[1]) {
          case "change":
            const formatted = {
              [delta[2].id]: delta[2],
            };
            mergeWith(modelWatcherData[modelUUID].machines, formatted);
            break;
          case "remove":
            delete modelWatcherData[modelUUID].machines[delta[2].id];
            break;
        }
        break;
      case "model":
        switch (delta[1]) {
          case "change":
            mergeWith(modelWatcherData[modelUUID].model, delta[2]);
            break;
        }
        break;
      case "relation":
        switch (delta[1]) {
          case "change":
            const formatted = {
              [delta[2].key]: delta[2],
            };
            mergeWith(modelWatcherData[modelUUID].relations, formatted);
            break;
          case "remove":
            delete modelWatcherData[modelUUID].relations[delta[2].key];
            break;
        }
        break;
      case "unit":
        switch (delta[1]) {
          case "change":
            const formatted = {
              [delta[2]["name"]]: delta[2],
            };
            mergeWith(modelWatcherData[modelUUID].units, formatted);
            break;
          case "remove":
            delete modelWatcherData[modelUUID].units[delta[2].name];
            break;
        }
        break;
    }
  });
  return modelWatcherData;
}
