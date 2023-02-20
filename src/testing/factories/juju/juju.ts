import { ModelStatusInfo } from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import {
  MachineHardware,
  ModelMachineInfo,
  ModelSLAInfo,
  ModelUserInfo,
} from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import { Factory } from "fishery";

import type {
  AdditionalController,
  Controller,
  ControllerLocation,
  JujuState,
  ModelData,
  ModelInfo,
  ModelListInfo,
  ModelsList,
} from "store/juju/types";
import type { ModelWatcherData } from "juju/types";
import { modelWatcherModelDataFactory } from "./model-watcher";

interface ModelFactoryData {
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

export const additionalControllerFactory = Factory.define<AdditionalController>(
  () => ({
    additionalController: true,
  })
);

export const controllerLocationFactory = Factory.define<ControllerLocation>(
  () => ({
    region: "aws",
  })
);

export const controllerFactory = Factory.define<Controller>(() => ({
  path: "admin/jaas",
  uuid: "a030379a-940f-4760-8fcf-3062b41a04e7",
}));

export const modelListInfoFactory = Factory.define<ModelListInfo>(() => ({
  name: "test-model",
  ownerTag: "user-eggman@external",
  type: "iaas",
  uuid: "84e872ff-9171-46be-829b-70f0ffake18d",
}));

export const modelDataStatusFactory = Factory.define<
  ModelData["applications"][0]["status"]
>(() => ({
  status: "available",
  info: "",
  data: {},
  since: "2019-11-12T23:49:17.148Z",
}));

export const modelDataUnitFactory = Factory.define<
  ModelData["applications"][0]["units"][0]
>(() => ({
  "agent-status": modelDataStatusFactory.build(),
  "workload-status": modelDataStatusFactory.build(),
  "workload-version": "3.0.1",
  machine: "1",
  "opened-ports": [],
  "public-address": "35.229.83.62",
  charm: "",
  subordinates: {},
  leader: true,
}));

export const modelDataApplicationFactory = Factory.define<
  ModelData["applications"][0]
>(() => ({
  charm: "cs:~containers/easyrsa-278",
  series: "bionic",
  exposed: false,
  life: "",
  relations: {},
  "can-upgrade-to": "",
  "subordinate-to": [],
  units: {},
  "meter-statuses": {},
  status: modelDataStatusFactory.build(),
  "workload-version": "3.0.1",
  "charm-version": "7af705f",
  "endpoint-bindings": {},
  "public-address": "",
}));

export const modelDataMachineNetworkInterfcaceFactory = Factory.define<
  ModelData["machines"][0]["network-interfaces"][0]
>(() => ({
  "ip-addresses": [],
  "mac-address": "a2:a2:53:31:db:9a",
  "is-up": true,
}));

export const modelDataMachineFactory = Factory.define<ModelData["machines"][0]>(
  () => ({
    "agent-status": modelDataStatusFactory.build(),
    "instance-status": modelDataStatusFactory.build(),
    "dns-name": "35.243.128.238",
    "ip-addresses": [],
    "instance-id": "juju-9cb18d-0",
    series: "bionic",
    id: "0",
    "network-interfaces": {},
    containers: {},
    constraints: "",
    hardware:
      "arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-east1-b",
    jobs: [],
    "has-vote": false,
    "wants-vote": false,
    "lxd-profiles": {},
  })
);

export const modelStatusInfoFactory = Factory.define<ModelStatusInfo>(() => ({
  name: "sub-test",
  type: "iaas",
  "cloud-tag": "cloud-google",
  region: "us-east1",
  version: "2.6.10",
  "available-version": "",
  "model-status": modelDataStatusFactory.build(),
  "meter-status": {
    color: "",
    message: "",
  },
  sla: "unsupported",
}));

export const modelUserInfoFactory = Factory.define<ModelUserInfo>(() => ({
  user: "user-eggman@external",
  "display-name": "eggman",
  "last-connection": "2019-11-15T18:31:36Z",
  access: "admin",
  "model-tag": "",
}));

export const machineHardwareFactory = Factory.define<MachineHardware>(() => ({
  arch: "amd64",
  mem: 1700,
  "root-disk": 10240,
  cores: 1,
  "cpu-power": 138,
  tags: [],
  "availability-zone": "us-east1-b",
}));

export const modelMachineInfoFactory = Factory.define<ModelMachineInfo>(() => ({
  id: "0",
  hardware: machineHardwareFactory.build(),
  "instance-id": "juju-9cb18d-0",
  status: "started",
}));

export const modelSLAInfoFactory = Factory.define<ModelSLAInfo>(() => ({
  level: "unsupported",
  owner: "",
}));

export const modelDataInfoFactory = Factory.define<ModelInfo>(() => ({
  name: "sub-test",
  type: "iaas",
  uuid: "84e872ff-9171-46be-829b-70f0ffake18d",
  "controller-uuid": "a030379a-940f-4760-8fcf-3062b41a04e7",
  "provider-type": "gce",
  "default-series": "bionic",
  "cloud-tag": "cloud-google",
  "cloud-region": "us-east1",
  "cloud-credential-tag": "cloudcred-google_eggman@external_juju",
  "owner-tag": "user-eggman@external",
  life: "alive",
  "is-controller": false,
  sla: modelSLAInfoFactory.build(),
  status: modelDataStatusFactory.build(),
  users: [],
  machines: [],
  "agent-version": "2.6.10",
}));

export const modelDataFactory = Factory.define<ModelData>(() => ({
  applications: {},
  machines: {},
  model: modelStatusInfoFactory.build(),
  offers: {},
  relations: null,
  uuid: generateUUID(),
  info: modelDataInfoFactory.build(),
  "remote-applications": {},
}));

export const jujuStateFactory = Factory.define<
  JujuState,
  {
    models: (Omit<ModelFactoryData, "uuid"> & {
      uuid?: ModelFactoryData["uuid"];
    })[];
  }
>(({ transientParams }) => {
  const modelWatcherData: ModelWatcherData = {};
  const modelsList: ModelsList = {};
  transientParams.models?.forEach((modelParams) => {
    const model = {
      ...modelParams,
      uuid: modelParams.uuid ?? generateUUID(),
    };

    modelsList[model.name] = modelListInfoFactory.build({
      name: model.name,
      ownerTag: `user-${model.owner}`,
      uuid: model.uuid,
    });

    modelWatcherData[model.uuid] = modelWatcherModelDataFactory.build({
      model,
    });
  });
  return {
    controllers: null,
    // XXX When the models list is updated the uuids created for the models list
    // will need to be internally consistent with the modelWatcher data.
    models: modelsList,
    modelData: null,
    modelWatcherData: modelWatcherData,
  };
});
