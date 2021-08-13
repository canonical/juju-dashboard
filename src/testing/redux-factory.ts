import { Factory } from "fishery";

import type { JujuState, UIState, ReduxState } from "types";
import type { ModelWatcherData } from "juju/types";

interface SetupTransients {
  models: ModelData[];
}

interface ModelData {
  name: string;
  owner: string;
}

export function reduxStateFactory() {
  return Factory.define<ReduxState, SetupTransients>(({ transientParams }) => {
    return {
      root: {
        config: {
          baseControllerURL: "jimm.jujucharms.com",
        },
      },
      juju: jujuStateFactory(transientParams.models).build(),
      ui: uiStateFactory().build(),
    };
  });
}

export function jujuStateFactory(models: ModelData[] = []) {
  const modelWatcherData = {};
  models.forEach((model) => {
    Object.assign(
      modelWatcherData,
      modelWatcherDataFactory().build({}, { transient: { ...model } })
    );
  });
  return Factory.define<JujuState>(() => ({
    // XXX When the models list is updated the uuids created for the models list
    // will need to be internally consistent with the modelWatcher data.
    models: null,
    modelData: null,
    modelWatcherData: modelWatcherData,
  }));
}

export function uiStateFactory() {
  return Factory.define<UIState>(() => ({
    confirmationModalActive: false,
    userMenuActive: false,
    sideNavCollapsed: false,
  }));
}

export function modelWatcherDataFactory() {
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      var r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  const uuid = generateUUID();
  return Factory.define<ModelWatcherData>(({ transientParams }) => {
    return {
      [uuid]: {
        model: {
          "cloud-tag": "cloud-aws",
          region: "us-east-1",
          type: "iaas",
          version: "2.8.7",
          "model-uuid": uuid,
          name: transientParams.name || "",
          life: "alive",
          owner: transientParams.owner || "",
          "controller-uuid": "", // XXX fix me
          "is-controller": false,
          config: {
            "default-series": "bionic",
          },
          status: {
            current: "available",
            message: "",
            since: "2021-07-28T22:05:36.877177235Z",
            version: "",
          },
          constraints: {},
          sla: {
            level: "unsupported",
            owner: "",
          },
        },
        charms: {
          "cs:apache": {
            "charm-url": "",
            "charm-version": "",
            config: {},
            life: "alive",
            "model-uuid": uuid,
            profile: null,
          },
        },
      },
    };
  });
}
