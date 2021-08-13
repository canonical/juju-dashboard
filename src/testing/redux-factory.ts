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

  const modelUUID = generateUUID();
  return Factory.define<ModelWatcherData>(({ transientParams }) => {
    return {
      [modelUUID]: {
        applications: {
          "ceph-mon": {
            "charm-url": "cs:ceph-mon-55",
            constraints: {},
            exposed: false,
            life: "alive",
            "min-units": 0,
            "model-uuid": modelUUID,
            name: "ceph-mon",
            "owner-tag": "",
            status: { current: "unset", message: "", version: "" },
            subordinate: false,
            "workload-version": "12.2.13",
          },
        },
        charms: {
          "cs:ceph-mon-55": {
            "charm-url": "",
            "charm-version": "",
            config: {},
            life: "alive",
            "model-uuid": modelUUID,
            profile: null,
          },
        },
        model: {
          "cloud-tag": "cloud-aws",
          region: "us-east-1",
          type: "iaas",
          version: "2.8.7",
          "model-uuid": modelUUID,
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
        units: {
          "ceph-mon/0": {
            "agent-status": {
              current: "idle",
              message: "",
              since: "2021-08-13T19:34:41.247417373Z",
              version: "2.8.7",
            },
            "charm-url": "cs:ceph-mon-55",
            "machine-id": "0",
            "model-uuid": modelUUID,
            "port-ranges": null,
            "private-address": "172.31.43.84",
            "public-address": "54.162.156.160",
            "workload-status": {
              current: "blocked",
              message:
                "Insufficient peer units to bootstrap cluster (require 3)",
              since: "2021-08-13T19:34:37.747827227Z",
              version: "",
            },
            application: "ceph-mon",
            life: "alive",
            name: "ceph-mon/0",
            ports: [],
            principal: "",
            series: "bionic",
            subordinate: false,
          },
        },
      },
    };
  });
}
