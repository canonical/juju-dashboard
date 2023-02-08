import { Factory } from "fishery";

import type { JujuState, ModelsList } from "types";
import type { ModelWatcherData } from "juju/types";

interface ModelData {
  name: string;
  owner: string;
  uuid: string;
  version?: string;
  type?: string;
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const jujuStateFactory = Factory.define<
  JujuState,
  { models: (Omit<ModelData, "uuid"> & { uuid?: ModelData["uuid"] })[] }
>(({ transientParams }) => {
  const modelWatcherData = {};
  const modelsList: ModelsList = {};
  transientParams.models?.forEach((modelParams) => {
    const model = {
      ...modelParams,
      uuid: modelParams.uuid ?? generateUUID(),
    };

    modelsList[model.name] = {
      name: model.name,
      ownerTag: `user-${model.owner}`,
      type: "iaas",
      uuid: model.uuid,
    };

    Object.assign(
      modelWatcherData,
      modelWatcherDataFactory.build({}, { transient: { ...model } })
    );
  });
  return {
    controllers: null,
    // XXX When the models list is updated the uuids created for the models list
    // will need to be internally consistent with the modelWatcher data.
    models: modelsList,
    modelData: null,
    modelWatcherData: modelWatcherData,
    charms: [],
  };
});

export const modelWatcherDataFactory = Factory.define<
  ModelWatcherData,
  ModelData
>(({ transientParams }) => {
  const modelUUID = transientParams.uuid ?? generateUUID();
  return {
    [modelUUID]: {
      actions: {
        "0": {
          "model-uuid": modelUUID,
          id: "0",
          receiver: "ceph-mon/0",
          name: "get-health",
          status: "failed",
          message: "Getting health failed, health unknown",
          parameters: { foo: "bar" }, // XXX Fix me
          results: {
            Code: "0",
            Stderr: "a long stderror message",
            message: "Getting health failed, health unknown",
          },
          enqueued: "2021-05-31T22:57:26Z",
          started: "2021-05-31T22:57:29Z",
          completed: "2021-05-31T22:57:30Z",
        },
      },
      annotations: {
        "ceph-mon": {
          "gui-x": "818",
          "gui-y": "563",
        },
      },
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
          "unit-count": 1,
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
      machines: {
        "0": {
          addresses: [
            { scope: "public", type: "ipv4", value: "54.162.156.160" },
            { scope: "local-cloud", type: "ipv4", value: "172.31.43.84" },
            { scope: "local-fan", type: "ipv4", value: "252.43.84.1" },
            { scope: "local-machine", type: "ipv4", value: "127.0.0.1" },
            { scope: "local-machine", type: "ipv6", value: "::1" },
          ],
          "agent-status": {
            current: "started",
            message: "",
            since: "2021-08-13T19:32:59.800842177Z",
            version: "2.8.7",
          },
          "container-type": "",
          "hardware-characteristics": {
            arch: "amd64",
            "availability-zone": "us-east-1a",
            "cpu-cores": 2,
            "cpu-power": 700,
            mem: 8192,
            "root-disk": 8192,
          },
          "has-vote": false,
          id: "0",
          "instance-id": "i-0a195974d9fdd9d16",
          "instance-status": {
            current: "running",
            message: "running",
            since: "2021-08-13T19:31:34.099184348Z",
            version: "",
          },
          jobs: ["JobHostUnits"],
          life: "alive",
          "model-uuid": modelUUID,
          series: "bionic",
          "supported-containers": ["lxd"],
          "supported-containers-known": true,
          "wants-vote": false,
        },
      },
      model: {
        "cloud-tag": "cloud-aws",
        region: "us-east-1",
        type: transientParams.type || "iaas",
        version: transientParams.version || "2.9.12",
        "model-uuid": modelUUID,
        name: transientParams.name || "enterprise",
        life: "alive",
        owner: transientParams.owner || "kirk@external",
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
      relations: {
        "wordpress:db mysql:db": {
          "model-uuid": modelUUID,
          key: "wordpress:db mysql:db",
          id: 0,
          interface: "mysql",
          endpoints: [
            {
              "application-name": "wordpress",
              relation: {
                interface: "mysql",
                limit: 0,
                name: "db",
                optional: false,
                role: "requirer",
                scope: "global",
              },
            },
            {
              "application-name": "mysql",
              relation: {
                interface: "mysql",
                limit: 0,
                name: "db",
                optional: false,
                role: "provider",
                scope: "global",
              },
            },
          ],
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
            message: "Insufficient peer units to bootstrap cluster (require 3)",
            since: "2021-08-13T19:34:37.747827227Z",
            version: "",
          },
          application: "ceph-mon",
          life: "alive",
          machine: "5",
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
